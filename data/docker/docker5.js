// Docker 教程 21–25：实战部署项目
const docker21 = {
  id: 'docker-deploy-webapp',
  title: '21. 实战：部署一个完整的 Web 应用（Flask + Redis + Nginx）',
  category: '实战',
  version: '25+',
  level: '进阶',
  summary: '使用 Compose 编排 Flask Web 应用、Redis 缓存与 Nginx 反向代理，生产级部署。',
  detail: [
    '整体架构：Nginx（反向代理+SSL 终止）→ Flask（应用服务器）→ Redis（缓存/会话）。',
    'Nginx 配置反向代理到 Flask（http://web:5000），并代理静态文件。',
    'Flask 使用 Gunicorn 作为 WSGI 服务器，多 worker 提高并发。',
    'Redis 作为缓存和 Session 存储。',
    '所有日志统一输出到 stdout，通过 docker logs 收集。',
    '配置 healthcheck 确保服务健康。',
  ],
  notes: [
    '生产部署永远通过反向代理（Nginx / Traefik）暴露服务，不要直接暴露应用端口。',
    'Gunicorn worker 数量 = 2 × CPU 核数 + 1 是一般推荐。',
  ],
  example: `# compose.yml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
  web:
    build: .
    restart: unless-stopped
    depends_on:
      redis:
        condition: service_healthy
    environment:
      - REDIS_URL=redis://redis:6379/0
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - web`,
};

const docker22 = {
  id: 'docker-database',
  title: '22. 实战：数据库容器化（PostgreSQL / MySQL / MongoDB）',
  category: '实战',
  version: '25+',
  level: '进阶',
  summary: '数据库容器化的最佳实践：持久化、初始化脚本、备份与恢复。',
  detail: [
    '使用命名卷持久化数据：-v pgdata:/var/lib/postgresql/data。',
    '初始化脚本：在 /docker-entrypoint-initdb.d/ 下放 .sql / .sh 文件，首次启动自动执行。',
    '通过环境变量配置数据库名称、用户、密码。',
    '备份：docker exec <db> pg_dumpall > backup.sql（MySQL：mysqldump）。',
    '恢复：cat backup.sql | docker exec -i <db> psql。',
    '不将数据库放在与 App 同一 Compose 中——生产应独立部署或使用 RDS 服务。',
  ],
  notes: [
    '容器内数据库的性能调优需额外配置 shared_buffers 等参数。',
    '生产数据库绝不使用 root 无密码运行——务必设置强密码并定期备份。',
  ],
  example: `# 初始化脚本 init.sql（放到 ./init/ 目录）
CREATE DATABASE appdb;
CREATE USER appuser WITH PASSWORD 'secret';
GRANT ALL ON DATABASE appdb TO appuser;

# compose 引用
services:
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d:ro
    environment:
      POSTGRES_PASSWORD: rootsecret
volumes:
  pgdata:

# 备份命令
docker exec -t postgres pg_dumpall -U postgres > backup_$(date +%F).sql`,
};

const docker23 = {
  id: 'docker-debug',
  title: '23. 实战：容器化应用调试与排查',
  category: '实战',
  version: '25+',
  level: '进阶',
  summary: '常见容器故障排查：容器立即退出 / 端口无法访问 / 网络不通 / 磁盘写满。',
  detail: [
    '容器退出码含义：0 正常退出、1 应用错误、137（SIGKILL，OOM Kill）、139（SIGSEGV 段错误）。',
    'docker logs 查看容器退出前日志；docker run -it 无 -d 则看前台输出。',
    'docker inspect 查看容器的 State / Mounts / NetworkSettings。',
    '端口无法访问：检查 -p 映射是否正确、容器内进程是否监听 0.0.0.0（而非 127.0.0.1）。',
    '网络问题：docker exec -it <c1> ping <c2>（需同自定义网络）；检查防火墙。',
    '磁盘写满：docker system df 查看；docker system prune 清理；注意日志文件。',
  ],
  notes: [
    '容器立即退出几乎总是主进程未保持前台运行——Dockerfile 的 CMD 不能是后台进程。',
    'ENTRYPOINT 与 CMD 的区别在此场景很关键：建议 ENTRYPOINT 写可执行文件，CMD 写默认参数。',
  ],
  example: `# 查看退出容器日志
docker logs <container_id>

# 进入容器排查
docker run -it --rm --network container:<target> nicolaka/netshoot

# 查看日志大小与清理
ls -lh /var/lib/docker/containers/<id>/<id>-json.log
truncate -s 0 /var/lib/docker/containers/<id>/<id>-json.log

# 查看容器 OOM 情况
docker inspect <container> | grep -A 5 "OOMKilled"`,
};

const docker24 = {
  id: 'docker-swarm-deploy',
  title: '24. 实战：Swarm 集群部署高可用应用',
  category: '实战',
  version: '25+',
  level: '高级',
  summary: '使用 Docker Swarm 部署 3 副本 Web 服务，实现滚动更新与故障迁移。',
  detail: [
    'Swarm 模式下的 docker stack deploy 将 Compose 文件转换为集群服务。',
    'deploy.replicas 设置副本数；update_config 控制滚动更新策略（parallelism / delay / failure_action）。',
    'Swarm 的 Routing Mesh 可将任意节点的已发布端口转发到任意副本。',
    'secret 和 config 是 Swarm 的内置资源——用于安全传递敏感信息和配置文件。',
    '滚动更新过程中，Swarm 按 parallelism 数量逐个替换副本。',
    '故障迁移：Worker 节点宕机后，Manager 会在另一节点重新调度副本。',
  ],
  notes: [
    'Swarm 不负责 DNS 或 TLS（需要外部工具如 Traefik）。',
    '调试 Swarm：docker service logs <svc> 查看所有副本日志。',
  ],
  example: `# docker-stack.yml
version: "3.9"
services:
  web:
    image: myapp:v1
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: any
    ports:
      - "80:8080"
  redis:
    image: redis:7-alpine
    deploy:
      replicas: 1
      placement:
        constraints: [node.role != manager]

# 部署
docker stack deploy -c docker-stack.yml myapp
# 滚动更新
docker service update --image myapp:v2 myapp_web`,
};

const docker25 = {
  id: 'docker-next-steps',
  title: '25. 学习路线与下一步：Docker → Kubernetes',
  category: '实战',
  version: '25+',
  level: '高级',
  summary: '总结 Docker 学习路径，推荐进阶方向：Kubernetes / Serverless / ECS。',
  detail: [
    'Docker 核心已涵盖：镜像构建、容器管理、Compose、网络、存储、安全、Swarm。',
    '推荐进阶方向 1：Kubernetes（K8s）——生产级容器编排的事实标准。',
    '推荐进阶方向 2：Docker 安全与镜像扫描（Trivy / Clair）。',
    '推荐进阶方向 3：CI/CD 深度集成（GitOps / ArgoCD / Flux）。',
    '推荐实践项目：用 Docker Compose 部署开源项目（GitLab / WordPress / Mattermost）。',
    '熟悉 CKA/CKAD 认证内容可系统学习 Kubernetes。',
  ],
  notes: [
    'Kubernetes 学习成本远高于 Docker Swarm——建议从 Minikube 或 kind 开始。',
    '不要一次性学习所有编排工具——先精通 Docker，再按需过渡到 K8s。',
  ],
  example: `# 推荐学习顺序
1. Docker 已掌握 ✓
2. Kubectl 基础：kubectl run / get / describe / logs
3. Minikube 或 kind：本地 K8s 集群
4. Pod / Deployment / Service / Ingress
5. Helm 包管理
6. Kustomize 配置管理
7. CI/CD 流水线集成

# kind（Kubernetes in Docker）快速集群
kind create cluster --name test
kubectl get nodes
kubectl create deployment nginx --image=nginx:alpine
kubectl expose deployment nginx --port=80 --type=NodePort`,
};

if (typeof module !== 'undefined') module.exports = { docker21, docker22, docker23, docker24, docker25 };