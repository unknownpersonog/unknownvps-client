hostnamectl set-hostname UnknownVPS
passwd root unknownvps
apt update
apt install wget openssh-server -y
rm -rf /etc/ssh/sshd_config
wget -O /etc/ssh/sshd_config https://raw.githubusercontent.com/dxomg/sshd_config/main/sshd_config
