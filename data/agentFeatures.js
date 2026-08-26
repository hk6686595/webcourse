// AI Agent 开发教程数据（聚合）
const sections = [
  require('./agent/agent1'),
  require('./agent/agent2')
];

module.exports = sections.flat();
