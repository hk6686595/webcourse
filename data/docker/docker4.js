// Docker 教程 16–20：安全 / Swarm / 镜像优化 / 开发工作流
const docker16 = {
  id: 'docker-security',
  title: '16. Docker 安全基础：非 root 运行 / 只读文件系统 / 能力管理',
  category: '安全',
  version: '25+',
  level: '进阶',
  summary: '使用非 root 用户运行容器、挂载只读文件系统、最小能力（Capabilities）原则。',
  detail: [
    'Dockerfile 中 USER 指令指定非 root 用户；或 docker run --user <uid>:<gid>。',
    '--read-only 将文件系统挂载为只读，防止容器内写入恶意文件。',
    '--cap-drop=ALL --cap-add=NET_BIND_SERVICE 删除所有特权能力，仅添加绑定端口所需。',
    '--security-opt=no-new-privileges 防止进程提权。',
    '--privileged 禁用所有隔离措施——绝不用于生产容器。',
    'Docker Bench Security（github.com/docker/docker-bench-security）一键扫描安全基线的工具。',
  ],
  notes: [
    '许多基础镜像默认以 root 运行（如 nginx），需自行修改 Dockerfile 切换用户。',
    '只读文件系统 + tmpfs 挂载 /tmp 是常见的安全组合。',
  ],
  example: `# Dockerfile 安全实践
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]

# docker run 安全参数
docker run -d --name secure-app \\
  --read-only \\
  --tmpfs /tmp \\
  --cap-drop=ALL --cap-add=NET_BIND_SERVICE \\
  --security-opt=no-new-privileges \\
  myapp`,
};

const docker17 = {
  id: 'docker-swarm',
  title: '17. Docker Swarm 入门：集群与服务部署',
  category: '编排',
  version: '25+',
  level: '进阶',
  summary: 'Docker Swarm 模式将多个 Docker 主机组成集群，原生支持服务发现与负载均衡。',
  detail: [
    'Swarm 有两种节点角色：Manager（管理/调度）和 Worker（运行任务）。',
    'docker swarm init 在第一个 Manager 上初始化集群；docker swarm join 添加 Worker。',
    'docker service create 部署服务（代替 docker run），支持副本数、滚动更新。',
    'Swarm 内置 DNS 和路由网格（Routing Mesh），任意节点端口均可访问服务。',
    'docker stack deploy -c <compose.yml> <name> 将 Compose 转换为 Swarm 服务栈。',
    'docker node ls / service ls / service ps 查看集群和服务状态。',
  ],
  notes: [
    'Swarm 在生产中不如 Kubernetes 流行，但简单轻量、与原生 Docker 无缝集成。',
    'Manager 节点应部署奇数个（3 / 5）以保证 Raft 共识。',
  ],
  example: `# 初始化 Swarm
docker swarm init --advertise-addr 192.168.1.100

# 部署服务（3 副本 Nginx，滚动更新）
docker service create --name web \\
  --replicas 3 \\
  --publish 80:80 \\
  --update-delay 10s \\
  nginx:alpine

# 查看服务状态
docker service ls
docker service ps web

# 使用 Compose 部署栈
docker stack deploy -c compose.yml mystack
docker stack services mystack`,
};

const docker18 = {
  id: 'docker-image-optimize',
  title: '18. 镜像优化最佳实践：体积、安全与构建速度',
  category: '镜像构建',
  version: '25+',
  level: '进阶',
  summary: '从基础镜像选择、层合并、依赖安装等多角度优化镜像。',
  detail: [
    '选择 alpine 或 distroless 基础镜像；避免使用 full（完整 Linux 发行版）镜像。',
    '合并 RUN 命令（&& 连接），删除包管理器缓存（rm -rf /var/cache/apk/*）。',
    'COPY package*.json ./ 与 RUN npm ci 放在源码 COPY 之前——利用层缓存。',
    '使用 npm ci（而非 npm install）获得确定性的依赖安装。',
    '多阶段构建将编译产物复制到轻量运行时镜像。',
    'docker dive 工具可以交互式分析每层内容，找出臃肿原因。',
  ],
  notes: [
    '每个 RUN / COPY 都会创建新层，缩小单层变化范围可以更好地利用缓存。',
    '镜像不应包含密钥或 .env——通过容器环境变量或 Secret 注入。',
  ],
  example: `# 优化前后对比
# ❌ 低效 Dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]

# ✅ 优化后
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production && rm -rf /root/.npm
COPY . .
USER node
CMD ["node", "server.js"]`,
};

const docker19 = {
  id: 'docker-ci-cd',
  title: '19. Docker 与 CI/CD 集成：GitHub Actions + Docker Build',
  category: 'CI/CD',
  version: '25+',
  level: '进阶',
  summary: '在 GitHub Actions / GitLab CI 中构建、标记并推送 Docker 镜像到仓库。',
  detail: [
    'GitHub Actions 使用 docker/build-push-action 构建并推送镜像。',
    '设置仓库的 Secrets（DOCKER_USERNAME / DOCKER_PASSWORD）避免明文凭证。',
    '使用 git tag（如 v1.0.0）触发构建，并用 ${⧣⧣GITHUB_REF#refs/tags/} 作为镜像标签。',
    '支持缓存：--cache-from type=gha 使用 GitHub Actions 缓存，加速后续构建。',
    'GitLab CI 使用 docker:dind（Docker-in-Docker）服务运行 docker 命令。',
    'Always 使用镜像摘要（SHA256）而非标签来部署，确保可重现性。',
  ],
  notes: [
    'docker:dind 需要特权模式；考虑使用 kaniko（Google）或 buildah 替代。',
    '敏感信息（Docker Hub Token）务必存入 Secrets 而非硬编码。',
  ],
  example: `# GitHub Actions 示例
# .github/workflows/docker.yml
name: Build & Push
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: myapp:\${{ github.ref_name }}`,
};

const docker20 = {
  id: 'docker-dev-workflow',
  title: '20. Docker 开发工作流：热重载 / 调试 / 多阶段 dev',
  category: '开发',
  version: '25+',
  level: '进阶',
  summary: '使用 Bind Mount 实现代码热重载、带调试工具的 Dev 镜像、容器内 IDE 远程开发。',
  detail: [
    '开发时使用 -v $(pwd):/app 将源码挂载入容器，本地修改即时生效（若框架支持热重载）。',
    '多 Dockerfile：Dockerfile.dev（含 nodemon / hot reload）与 Dockerfile.prod（最小镜像）。',
    'Docker Compose 的 override 文件可切换开发/生产配置。',
    'VSCode Dev Containers：.devcontainer/devcontainer.json 定义容器化开发环境。',
    '使用 docker compose watch（v2.23+）自动监视文件变更并重建/重启。',
    'docker attach 可接入容器主进程的标准 I/O。',
  ],
  notes: [
    'Bind Mount 在 macOS 和 Windows 上由于文件系统映射性能较差（尤其是大量小文件）。',
    '.dockerignore 在开发环境中同样重要——排除 node_modules 提高挂载性能。',
  ],
  example: `# docker-compose.dev.yml（开发覆盖）
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - /app/node_modules  # 命名卷排除宿主机的 node_modules
    environment:
      - NODE_ENV=development
      - DEBUG=true

# VSCode .devcontainer/devcontainer.json
{
  "name": "Node Dev",
  "dockerComposeFile": ["../docker-compose.yml", "../docker-compose.dev.yml"],
  "service": "web",
  "workspaceFolder": "/app",
  "extensions": ["dbaeumer.vscode-eslint"]
}`,
};

if (typeof module !== 'undefined') module.exports = { docker16, docker17, docker18, docker19, docker20 };