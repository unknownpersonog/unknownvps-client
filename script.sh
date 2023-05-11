#!/bin/bash
hostnamectl set-hostname ${vpsName}
echo -e \'${vpsPassword}\n${vpsPassword}\' | passwd root
apt-get update,
apt-get install wget openssh-server -y
rm -rf /etc/ssh/sshd_config
curl -Lo /etc/ssh/sshd_config https://raw.githubusercontent.com/dxomg/sshd_config/main/sshd_config
systemctl restart ssh
systemctl restart sshd
reboot
