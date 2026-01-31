# Caddy sites (managed by Ansible)

Do not edit files here manually. Caddy site configs are generated from
`ansible/group_vars/vps.secrets.yml` and applied by the Ansible playbook.

To change sites:
1) Edit `caddy_sites` in the vault file.
2) Run `ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass`.
