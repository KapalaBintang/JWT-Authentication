import redisClient from "../config/redisClient"; // Config Redis di file lain

type CacheCallback<T> = () => Promise<T>;

export const getOrSetCache = async <T>(key: string, cb: CacheCallback<T>, expiration = 3600): Promise<T> => {
  try {
    const data = await redisClient.get(key); // Menggunakan Promise untuk Redis get
    if (data !== null) return JSON.parse(data) as T;

    // Data tidak ada di cache, fetch data baru
    const freshData = await cb();

    // Menyimpan data ke Redis dengan EX (expiry time)
    await redisClient.set(key, JSON.stringify(freshData), { EX: expiration });

    return freshData;
  } catch (err) {
    throw new Error(`Cache error: ${err}`);
  }
};
