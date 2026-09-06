// Docker 教程 1–5：容器入门与基础操作
const docker1 = {
  id: 'docker-what-is',
  title: '1. 容器与镜像：Docker 是什么',
  category: '入门与安装',
  version: '25+',
  level: '入门',
  summary: '理解 Docker 的核心概念——镜像（Image）、容器（Container）、仓库（Registry），以及与虚拟机的区别。',
  detail: [
    '镜像是一个轻量级、只读的模板，包含了运行应用所需的代码、运行时、库、环境变量和配置文件。',
    '容器是镜像的运行实例，具有隔离的文件系统、网络和进程空间；容器可以被启动、停止、删除。',
    '仓库（Registry）用于存储和分发镜像，最常用的是 Docker Hub（hub.docker.com）。',
    '与传统虚拟机相比，Docker 容器共享宿主机内核，无需完整 OS，启动毫秒级，资源开销极小。',
    'Docker 使用 Client-Server 架构：CLI 通过 REST API 与 dockerd 守护进程通信。',
    '镜像由多层（Layer）组成，每一层对应 Dockerfile 中的一条指令，分层机制实现高效缓存与复用。',
  ],
  notes: [
    '容器不等于轻量级虚拟机——它们共享内核，不能运行与宿主机不同的 OS（例如 Linux 容器无法直接运行 Windows 内核）。',
    '镜像层是只读的；容器启动时在镜像层之上添加一个可写层（容器层），数据持久化需用 Volume。',
  ],
  example: `# 查看 Docker 版本
docker version

# 从 Docker Hub 拉取镜像
docker pull hello-world

# 运行容器（若本地无镜像则自动拉取）
docker run hello-world

# 列出运行中的容器
docker ps

# 列出所有容器（含已停止）
docker ps -a`,
  example2: `# 运行 Nginx 并映射端口
docker run -d -p 8080:80 --name my-nginx nginx:alpine

# 访问 http://localhost:8080 即可看到 Nginx 欢迎页
# -d: 后台运行; -p 8080:80: 宿主机8080→容器80; --name: 容器命名`,
  example3: `# 查看镜像分层信息
docker history nginx:alpine

# 查看容器资源使用
docker stats`,
};

const docker2 = {
  id: 'docker-install',
  title: '2. Docker 安装与环境配置',
  category: '入门与安装',
  version: '25+',
  level: '入门',
  summary: '在 Linux / macOS / Windows 上安装 Docker Engine 或 Docker Desktop，验证环境。',
  detail: [
    'Linux 推荐使用官方脚本安装：curl -fsSL https://get.docker.com | sh，自动适配发行版。',
    'macOS 和 Windows 推荐安装 Docker Desktop，包含 Engine、CLI、Compose、Kubernetes。',
    '安装后务必执行 sudo usermod -aG docker $USER 将当前用户加入 docker 组（Linux），然后重新登录。',
    '验证：docker run hello-world 应输出 Hello from Docker! 信息。',
    '配置镜像加速器（如阿里云、中科大）可大幅提升国内拉取速度。',
    'WSL2 后端（Windows）性能优于 Hyper-V，推荐在 WSL2 模式下使用 Docker Desktop。',
  ],
  notes: [
    '加入 docker 组后需重新登录（或 newgrp docker）才能免 sudo 运行 docker 命令。',
    '生产环境请勿使用 Docker Desktop，使用 Docker Engine + containerd 即可。',
  ],
  example: `# Linux 一键安装
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# 重新登录后验证
docker run hello-world

# 配置镜像加速器（/etc/docker/daemon.json）
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://<你的加速器>.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload && sudo systemctl restart docker`,
};

const docker3 = {
  id: 'docker-run',
  title: '3. docker run 详解：端口、卷、环境变量与命名',
  category: '容器操作',
  version: '25+',
  level: '入门',
  summary: '掌握 docker run 的常用参数：端口映射、数据卷挂载、环境变量、容器命名与重启策略。',
  detail: [
    '-d：后台运行容器；--rm：容器停止后自动删除。',
    '-p <host_port>:<container_port>：端口映射；-P：随机映射暴露的端口。',
    '-v <host_path>:<container_path> 或 --mount type=bind,source=...,target=...：挂载数据卷。',
    '-e VAR=value：传入环境变量；--env-file .env：从文件读取环境变量。',
    '--name <name>：为容器指定名称；--restart <policy>：重启策略（no / on-failure / always / unless-stopped）。',
    '--network <network>：指定容器网络；--ip <ip>：指定静态 IP（需自定义网络）。',
  ],
  notes: [
    '-v 若宿主机路径不存在不会报错，Docker 会自动创建目录（可能权限异常）。',
    '生产环境推荐使用 --mount 而非 -v，语义更清晰。',
  ],
  example: `# 完整示例：运行 MySQL 8.0
docker run -d \\
  --name mysql8 \\
  -p 3306:3306 \\
  -e MYSQL_ROOT_PASSWORD=mysecret \\
  -e MYSQL_DATABASE=appdb \\
  -v mysql_data:/var/lib/mysql \\
  --restart always \\
  mysql:8.0`,
};

const docker4 = {
  id: 'dockerfile',
  title: '4. Dockerfile 编写：构建第一个自定义镜像',
  category: '镜像构建',
  version: '25+',
  level: '入门',
  summary: '学习 Dockerfile 常用指令：FROM、RUN、COPY、ADD、CMD、ENTRYPOINT、WORKDIR、EXPOSE。',
  detail: [
    'FROM 指定基础镜像，应优先选择官方 alpine 版本（如 node:20-alpine）以减小体积。',
    'RUN 执行构建时的命令，多个 RUN 应合并（&& 连接）以减少层数。',
    'COPY 复制本地文件到镜像；ADD 支持 tar 自动解压和 URL 下载（不推荐用 URL）。',
    'WORKDIR 设置工作目录，后续 RUN/CMD/ENTRYPOINT 都在此目录执行。',
    'CMD 提供容器默认命令（可被 docker run 参数覆盖）；ENTRYPOINT 设定入口（不可覆盖，除非 --entrypoint）。',
    'EXPOSE 声明容器监听的端口（仅文档用途，实际映射仍需 -p）。',
  ],
  notes: [
    '每个 RUN、COPY、ADD 都会创建一个新层；尽量合并命令来减少镜像层数。',
    '.dockerignore 文件可以排除不需要的文件，类似于 .gitignore。',
  ],
  example: `# 一个简单的 Node.js 应用 Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`,
  example2: `# Python Flask 应用多阶段构建
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dirs -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]`,
};

const docker5 = {
  id: 'docker-build',
  title: '5. 镜像构建与分层缓存机制',
  category: '镜像构建',
  version: '25+',
  level: '入门',
  summary: '深入理解 docker build 过程、层缓存原理、如何利用缓存加速构建。',
  detail: [
    'docker build -t <name>:<tag> . 使用当前目录下的 Dockerfile 构建镜像，上下文为 .。',
    '构建上下文会被发送到 dockerd；若非必要文件应写入 .dockerignore。',
    '每一行指令对应一个层（Layer），Docker 缓存未变化的层，只重建变更层。',
    'COPY/ADD 的缓存依据是文件内容的 checksum；RUN 的缓存依据是上一条指令的缓存状态。',
    '合理排序指令：把不常变的（安装依赖）放在前面，频繁改动的（COPY 源码）放在后面。',
    '使用 --no-cache 禁用缓存，--cache-from 从指定镜像复用缓存。',
  ],
  notes: [
    '构建上下文过大（含 node_modules 等）会拖慢构建；务必配置 .dockerignore。',
    '使用 docker buildx 可以构建多架构镜像（amd64 + arm64）。',
  ],
  example: `# 构建命令
docker build -t myapp:v1 .

# 查看镜像大小
docker images myapp

# 查看镜像构建历史（每层大小）
docker history myapp:v1

# 多架构构建（需启用 buildx）
docker buildx build --platform linux/amd64,linux/arm64 \\
  -t myapp:multi --push .`,
};

// 导出
if (typeof module !== 'undefined') module.exports = { docker1, docker2, docker3, docker4, docker5 };