/**
 * 数据库层统一出口。
 * 对外暴露 db 单例与全部 repository。
 */
export { db } from './database';
export * from './repositories';
