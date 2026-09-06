// Docker 教程 6–10：容器生命周期 / 网络 / Compose
const docker6 = {
  id: 'docker-lifecycle',
  title: '6. 容器生命周期管理：start / stop / rm / logs / exec',
  category: '容器操作',
  version: '25+',
  level: '入门',
  summary: '掌握容器的完整生命周期命令：创建、启动、停止、重启、进入、查看日志。',
  detail: [
    'docker start <container>：启动已停止的容器；docker stop <container>：优雅停止（发 SIGTERM，超时后 SIGKILL）。',
    'docker kill <container>：强制停止（直接 SIGKILL）；docker restart <container>：停止再启动。',
    'docker rm <container>：删除已停止的容器；-f 强制删除运行中的（先 kill）。',
    'docker exec -it <container> <command>：在运行中的容器里执行命令（-it 交互模式）。',
    'docker logs <container>：查看标准输出；-f 跟踪；--tail N 只看最后 N 行。',
    'docker inspect <container>：查看容器完整元数据（JSON），含网络、挂载、Env 等。',
  ],
  notes: [
    'docker exec -it <container> sh 是最常用的进入容器手段（容器内通常无 bash）。',
    '容器主进程退出后容器即停止；不要用 docker exec 运行后台服务。',
  ],
  example: `# 完整生命周期
docker run -d --name test -p 8080:80 nginx:alpine
docker ps
docker logs -f test
docker exec -it test sh
# 在容器内：ls /usr/share/nginx/html
docker stop test
docker start test
docker rm -f test`,
};

const docker7 = {
  id: 'docker-port-volume',
  title: '7. 端口映射与数据卷：数据持久化',
  category: '数据管理',
  version: '25+',
  level: '入门',
  summary: '理解端口映射的多种形式与 Docker 数据持久化的三种方式：Volume、Bind Mount、tmpfs。',
  detail: [
    '端口映射语法：-p <host>:<container>（如 -p 8080:80），可指定 IP（-p 127.0.0.1:8080:80）。',
    'Volume 由 Docker 管理（docker volume create），存储在 /var/lib/docker/volumes/，最适合持久化数据。',
    'Bind Mount 直接映射宿主机目录，适合开发场景（热更新代码）。',
    'tmpfs 挂载到内存，适合敏感数据（密码）或缓存，容器停止后数据消失。',
    'docker volume ls / inspect / prune / rm 可管理 Volume。',
    '--volumes-from <container> 可让容器共享另一个容器的卷。',
  ],
  notes: [
    'Bind Mount 在容器内文件的属主可能和宿主机不同（UID 映射问题）。',
    '数据库数据始终用 Volume（命名卷），不要用 Bind Mount。',
  ],
  example: `# 命名卷
docker volume create appdata
docker run -d -v appdata:/data --name app myapp

# Bind Mount（开发模式）
docker run -d -v $(pwd)/src:/app/src node:20-alpine

# 查看卷信息
docker volume inspect appdata
docker run -it --rm -v appdata:/data alpine ls /data`,
};

const docker8 = {
  id: 'docker-network',
  title: '8. 容器网络：bridge / host / none / 自定义网络',
  category: '网络',
  version: '25+',
  level: '入门',
  summary: '理解 Docker 网络模型：bridge 默认网络、host 模式、自定义网络与服务发现。',
  detail: [
    'bridge（默认）：容器通过 docker0 虚拟网桥通信，可访问外网（NAT），但容器间需通过 IP 互访。',
    '自定义 bridge 网络：容器间可通过容器名直接解析（内置 DNS），推荐多容器通信使用。',
    'host 模式：容器直接使用宿主机网络栈，无网络隔离（性能最好，仅 Linux 支持）。',
    'none：无网络，适合离线场景。',
    'overlay：跨宿主机网络，用于 Docker Swarm / Kubernetes 集群。',
    'macvlan：分配物理网络 MAC 地址，容器直接接入 LAN。',
  ],
  notes: [
    '默认 bridge 网络不支持通过容器名解析 IP；创建自定义网络即可支持。',
    'host 模式降低隔离性，仅适用于对网络性能要求极高的场景。',
  ],
  example: `# 创建自定义网络
docker network create --driver bridge mynet

# 两个容器接入同一网络
docker run -d --name web --network mynet nginx:alpine
docker run -d --name db --network mynet -e POSTGRES_PASSWORD=secret postgres:16

# 从 web 容器 ping db（通过名称）
docker exec web ping db

# 查看网络详情
docker network inspect mynet`,
};

const docker9 = {
  id: 'docker-compose-intro',
  title: '9. Docker Compose 入门：编排多容器应用',
  category: 'Compose',
  version: 'v2.x',
  level: '入门',
  summary: '用 docker-compose.yml 定义和运行多容器应用，一条命令启动整个栈。',
  detail: [
    'Compose 通过 YAML 文件定义 services / networks / volumes，取代手写多行 docker run。',
    'services 下每个服务对应一个容器，可指定 image / build / ports / volumes / env 等。',
    'docker compose up -d 启动所有服务；docker compose down 停止并删除。',
    'docker compose logs -f 查看所有服务日志；docker compose exec <svc> <cmd> 进入特定服务。',
    'depends_on 控制服务启动顺序（仅等待容器启动，不等其内部服务就绪）。',
    'healthcheck 可用更可靠的方式控制启动依赖（如 wait-for-it 脚本）。',
  ],
  notes: [
    'docker-compose（v1，已弃用）与 docker compose（v2，插件）是不同的命令；推荐使用 v2。',
    'depends_on 只是等待容器启动，而非等待内部服务可用；生产需额外健康检查。',
  ],
  example: `# docker-compose.yml
version: "3.9"
services:
  web:
    build: ./web
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret
volumes:
  pgdata:`,
};

const docker10 = {
  id: 'docker-compose-advanced',
  title: '10. Compose 进阶：环境变量 / 配置 / 扩展 / 多环境',
  category: 'Compose',
  version: 'v2.x',
  level: '进阶',
  summary: '在 Compose 中使用 .env 文件、扩展字段、profiles、多配置合并实现多环境部署。',
  detail: [
    'Compose 自动读取同一目录下的 .env 文件，YAML 中用 $\u007bVAR} 或 $VAR 引用。',
    '支持 YAML 锚点（&）和引用（*）复用配置片段，减少重复。',
    'profiles 可以按环境启用/禁用服务（如 dev / prod / debug）。',
    '使用 -f 指定多个 compose 文件进行分层配置：docker compose -f base.yml -f prod.yml up。',
    'extends（v2）在 v3 中被 profiles + 多文件覆盖取代，推荐用多文件方式。',
    '--env-file 可指定不同的 .env 路径来切换环境。',
  ],
  notes: [
    '多个 compose 文件的 Order 很重要：后面的文件会覆盖前面的相同字段。',
    '敏感信息（密码）应使用 .env 文件而非直接写在 YAML 中，且 .env 必须加入 .gitignore。',
  ],
  example: `# docker-compose.override.yml（自动加载，用于开发）
services:
  web:
    volumes:
      - ./src:/app/src
    environment:
      - DEBUG=true

# 生产：docker compose -f compose.yml -f compose.prod.yml up -d
# compose.prod.yml
services:
  web:
    restart: always
    deploy:
      replicas: 3`,
};

if (typeof module !== 'undefined') module.exports = { docker6, docker7, docker8, docker9, docker10 };