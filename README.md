# ihetzr

Hetzner infra + ops toolkit for a shared VPS: Pulumi for provisioning and Ansible for
ongoing configuration.

## Quick start

1) Provision server + DNS:
```bash
cd /Users/villeheikkila/Developer/ihetzr
pulumi up
```

2) Configure server with Ansible:
```bash
cd /Users/villeheikkila/Developer/ihetzr/ansible
# edit inventory.ini with server IP
# edit group_vars/vps.yml for S3, Caddy email, GHCR
ansible-vault create group_vars/vps.secrets.yml
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
```

## Pulumi config

Required:
- `sshPublicKeyPath`
- `domains` (JSON array)

Optional:
- `sshUser` (default `deploy`)

## Ansible

Edit `ansible/group_vars/vps.yml` for:
- `caddy_email`
- `pgbackrest` S3 settings
- `ghcr_login` if private images
- Postgres tuning

Define service-specific DBs and Caddy sites in `ansible/group_vars/vps.secrets.yml`.
