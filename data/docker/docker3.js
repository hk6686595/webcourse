// Docker 教程 11–15：镜像仓库 / 多阶段 / 资源限制 / 日志 / 健康检查
const docker11 = {
  id: 'docker-registry',
  title: '11. 镜像仓库：推送与拉取、私有仓库搭建',
  category: '镜像构建',
  version: '25+',
  level: '进阶',
  summary: '掌握 docker push / pull 与 tag 管理，搭建本地 Registry 供内网使用。',
  detail: [
    'docker tag <image> <registry>/<name>:<tag> 给镜像打标签；docker push 推送到仓库。',
    'Docker Hub 无需 registry 前缀，私有仓库需配 /etc/docker/daemon.json 的 insecure-registries。',
    'docker search <name> 搜索 Hub 镜像；docker pull <image> 拉取。',
    'digest（SHA256 摘要）确保镜像内容不变；docker images --digests 查看。',
    '可自建 registry（docker run -d -p 5000:5000 --name registry registry:2）。',
    '使用 harbor（VMware）或 Nexus 作为企业级镜像仓库，支持 RBAC 和漏洞扫描。',
  ],
  notes: [
    'Docker Hub 匿名用户有拉取速率限制（约 100 次/6 小时），推荐登录 docker login 提高限额。',
    '生产环境从不应直接使用 latest 标签——始终使用语义版本标签。',
  ],
  example: `# 打标签并推送
docker tag myapp:v1 myregistry.com/prod/myapp:1.0.0
docker push myregistry.com/prod/myapp:1.0.0

# 私有仓库（HTTP，非生产）
echo '\u007b"insecure-registries": ["192.168.1.100:5000"]}' | sudo tee -a /etc/docker/daemon.json

# 拉取指定摘要
docker pull node@sha256:<digest>`,
};

const docker12 = {
  id: 'docker-multistage',
  title: '12. 多阶段构建：大幅缩减镜像体积',
  category: '镜像构建',
  version: '25+',
  level: '进阶',
  summary: '使用多阶段构建（Multi-Stage Build）分离编译环境与运行环境，使镜像最小化。',
  detail: [
    '一个 Dockerfile 可含多个 FROM，每个 FROM 开始一个新阶段。',
    '前一阶段产物用 COPY --from=<阶段名|序号> 复制到后一阶段。',
    '典型 Go 场景：FROM golang:1.22 AS builder → 编译 → FROM alpine → COPY --from=builder /app /app。',
    'AS 命名阶段；0 是第一个 FROM 的编号索引。',
    '未 COPY 的产物不进入最终镜像，实现"瘦身"。',
    '常见最佳实践：最终镜像用 alpine 或 distroless（Google distroless 镜像无 shell）。',
  ],
  notes: [
    '多阶段不会增加镜像数——只有最后一个 FROM 及其后续指令进入最终镜像。',
    'distroless 镜像只有应用和运行时库，无 shell / 包管理器，更小更安全。',
  ],
  example: `# Go 多阶段构建
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]`,
  example2: `# 前端 + 静态服务
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf`,
};

const docker13 = {
  id: 'docker-resource-limit',
  title: '13. 容器资源限制：CPU / 内存 / 磁盘 I/O',
  category: '运维',
  version: '25+',
  level: '进阶',
  summary: '限制容器的 CPU、内存、磁盘 I/O 用量，防止单个容器耗尽宿主机资源。',
  detail: [
    '--memory：内存上限（如 512m / 2g）；--memory-swap：内存+swap 上限（设为相同值可禁用 swap）。',
    '--cpus：CPU 核数上限（如 1.5）；--cpuset-cpus：绑定特定 CPU 核心（如 0-2）。',
    '--blkio-weight：磁盘 I/O 优先级（10–1000，默认 500）。',
    '--pids-limit：限制容器内进程数，防止 fork 炸弹。',
    '--restart=on-failure:N：限制重启次数，防止无限重启循环。',
    'docker stats 查看所有容器的实时资源使用情况。',
  ],
  notes: [
    '内存限制不能超过宿主机物理内存；默认容器可以无限制使用宿主机所有资源。',
    '内存限制过小（不含 swap）可能导致容器被 OOM Kill。',
  ],
  example: `# 限制 Nginx 使用 256MB 内存 + 0.5 核
docker run -d --name limited-nginx \\
  --memory="256m" --memory-swap="256m" \\
  --cpus="0.5" \\
  nginx:alpine

# 实时监控
docker stats limited-nginx

# Compose 中的资源限制
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M`,
};

const docker14 = {
  id: 'docker-logging',
  title: '14. 日志与调试：logs / events / inspect / 第三方日志驱动',
  category: '运维',
  version: '25+',
  level: '进阶',
  summary: '容器日志管理：日志驱动（json-file / journald / fluentd）、日志轮转、调试技巧。',
  detail: [
    'docker logs 默认使用 json-file 驱动，日志写入 /var/lib/docker/containers/<id>/<id>-json.log。',
    '配置 log-opts max-size 和 max-file 限制日志文件大小和数量。',
    '其他日志驱动：journald（systemd）、syslog、fluentd、gelf、awslogs。',
    'docker events 实时流式输出宿主机上的 Docker 事件（create / start / stop / kill）。',
    'docker system df 查看磁盘使用；docker system prune 清理未使用的镜像、容器、卷。',
    'docker inspect <container> | jq . 查看完整配置及当前状态。',
  ],
  notes: [
    '默认日志驱动无轮转，长期运行容器可能撑满磁盘——务必配置 max-size。',
    '生产环境推荐 fluentd 或 journald，集中管理日志。',
  ],
  example: `# 配置日志轮转（启动时）
docker run -d --name app \\
  --log-opt max-size=10m --log-opt max-file=3 \\
  myapp

# 全局日志配置（/etc/docker/daemon.json）
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 查看实时事件
docker events --filter 'type=container' --filter 'event=die'`,
};

const docker15 = {
  id: 'docker-healthcheck',
  title: '15. 健康检查与重启策略：容器自愈',
  category: '运维',
  version: '25+',
  level: '进阶',
  summary: '通过 HEALTHCHECK 和 --restart 策略实现容器自愈，提升服务可用性。',
  detail: [
    'HEALTHCHECK（Dockerfile）或 healthcheck（Compose）定义探针命令，定期检查容器是否"健康"。',
    '探针返回值：0 健康（healthy）、1 不健康（unhealthy）。',
    '--restart=always：无论退出码如何都重启；--restart=unless-stopped：除非手动停止否则重启。',
    '--restart=on-failure:N：仅退出码非零时重启，最多 N 次。',
    'docker ps 的 STATUS 列显示已运行时间和重启次数（如 Up 2 hours (restarted 3 times)）。',
    '结合 HEALTHCHECK 和 on-failure 可实现"不健康则重启"的自动恢复。',
  ],
  notes: [
    '--restart=always 不会在 daemon 启动时立即重启，而是等待容器完成启动流程。',
    'healthcheck 需容器内包含 curl / wget 等工具——使用 alpine 镜像时注意。',
  ],
  example: `# Dockerfile 健康检查
FROM nginx:alpine
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget -q -O /dev/null http://localhost || exit 1

# Compose 健康检查
services:
  web:
    image: myapp
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s`,
};

if (typeof module !== 'undefined') module.exports = { docker11, docker12, docker13, docker14, docker15 };