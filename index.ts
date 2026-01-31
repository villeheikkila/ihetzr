import * as fs from "fs";
import * as path from "path";

import * as hcloud from "@pulumi/hcloud";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const sshPublicKeyPath = config.require("sshPublicKeyPath");
const domains = config.requireObject<string[]>("domains");
const recordNames = config.getObject<string[]>("recordNames") ?? [
  "@",
  "www",
  "api",
];
const recordTtl = config.getNumber("recordTtl") ?? 60;
const sshUser = config.get("sshUser") ?? "deploy";

const serverName = config.get("serverName") ?? "ihetzr";
const sshKeyName =
  config.get("sshKeyName") ?? `${pulumi.getProject()}-${pulumi.getStack()}-ssh`;
const sshPublicKey = fs
  .readFileSync(path.resolve(sshPublicKeyPath), "utf8")
  .trim();
const toNumber = (value: pulumi.Input<string>) =>
  pulumi.output(value).apply((v) => Number(v));

const network = new hcloud.Network("ihetzr-network", {
  ipRange: "10.0.0.0/16",
});

new hcloud.NetworkSubnet("ihetzr-subnet", {
  networkId: toNumber(network.id),
  type: "cloud",
  networkZone: "eu-central",
  ipRange: "10.0.1.0/24",
});

const firewall = new hcloud.Firewall("ihetzr-firewall", {
  rules: [
    {
      direction: "in",
      protocol: "tcp",
      port: "22",
      sourceIps: ["0.0.0.0/0", "::/0"],
    },
    {
      direction: "in",
      protocol: "tcp",
      port: "80",
      sourceIps: ["0.0.0.0/0", "::/0"],
    },
    {
      direction: "in",
      protocol: "tcp",
      port: "443",
      sourceIps: ["0.0.0.0/0", "::/0"],
    },
  ],
});

const sshKey = new hcloud.SshKey("ihetzr-ssh-key", {
  name: sshKeyName,
  publicKey: sshPublicKey,
});

const server = new hcloud.Server("ihetzr-server", {
  name: serverName,
  image: "ubuntu-24.04",
  serverType: "cx33",
  location: "hel1",
  sshKeys: [sshKey.name],
  firewallIds: [toNumber(firewall.id)],
  networks: [{ networkId: toNumber(network.id) }],
  publicNets: [{ ipv4Enabled: true, ipv6Enabled: true }],
  userData: renderCloudInit(),
});

function renderCloudInit() {
  const templatePath = path.resolve(__dirname, "cloud-init", "cloud-init.yaml");
  const template = fs.readFileSync(templatePath, "utf8");

  return template
    .replace(/__SSH_USER__/g, sshUser)
    .replace("__SSH_PUBLIC_KEY__", sshPublicKey);
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeRrset = (
  zone: pulumi.Input<string>,
  resourcePrefix: string,
  name: string,
  type: "A" | "AAAA",
  value: pulumi.Input<string>,
) =>
  new hcloud.ZoneRrset(`${resourcePrefix}-${name}-${type.toLowerCase()}`, {
    zone,
    name,
    type,
    ttl: recordTtl,
    records: [{ value }],
  });

const zones = domains.map((domainName) => {
  const zoneSlug = slugify(domainName);
  const zone = new hcloud.Zone(`ihetzr-zone-${zoneSlug}`, {
    name: domainName,
    mode: "primary",
  });
  recordNames.forEach((recordName) => {
    const recordSlug = slugify(recordName === "@" ? "root" : recordName);
    const prefix = `ihetzr-${zoneSlug}-${recordSlug}`;
    makeRrset(zone.name, prefix, recordName, "A", server.ipv4Address);
    makeRrset(zone.name, prefix, recordName, "AAAA", server.ipv6Address);
  });
  return zone;
});

export const serverIPv4 = server.ipv4Address;
export const serverIPv6 = server.ipv6Address;
export const serverNameOutput = server.name;
export const dnsZones = zones.map((zone) => zone.name);
export const authoritativeNameservers = zones.map(
  (zone) => zone.authoritativeNameservers,
);
