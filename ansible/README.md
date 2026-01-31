# ihetzr Ansible

## Usage

```bash
# Add your server IP in inventory.ini
ansible-vault create group_vars/vps.secrets.yml
ansible-playbook -i inventory.ini playbook.yml
```

## Notes

- Set `ghcr_login=true` and provide `ghcr_username`/`ghcr_token` in `group_vars/vps.yml` if you want the VPS to pull private images.
- Update S3 settings for pgBackRest in `group_vars/vps.yml`.
- Define `postgres_databases` and `caddy_sites` in `group_vars/vps.secrets.yml` to keep service names private.
