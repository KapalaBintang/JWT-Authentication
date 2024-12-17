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

export const invalidateCacheByKey = async (key: string): Promise<void> => {
  try {
    const result = await redisClient.del(key);
    if (result === 1) {
      console.log(`Cache dengan key "${key}" berhasil dihapus.`);
    } else {
      console.log(`Key "${key}" tidak ditemukan di cache.`);
    }
  } catch (err) {
    console.error(`Gagal menghapus cache dengan key "${key}": ${err}`);
  }
};

export const invalidateCacheByPattern = async (pattern: string): Promise<void> => {
  let cursor = 0; // Kursor dimulai dari 0
  const keysToDelete: string[] = []; // Menyimpan key yang cocok

  try {
    do {
      // Menjalankan SCAN command untuk menemukan key berdasarkan pola
      const reply: any = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = Number(reply[0]); // Update kursor
      const keys = reply[1]; // Key yang ditemukan pada iterasi ini

      if (keys.length > 0) {
        keysToDelete.push(...keys);
      }
    } while (cursor !== 0); // Lanjutkan sampai kursor kembali ke 0 (semua key telah di-scan)

    // Jika ada key yang cocok, hapus semua key tersebut
    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
      console.log(`Deleted ${keysToDelete.length} keys matching pattern '${pattern}'`);
    } else {
      console.log(`No keys found for pattern '${pattern}'`);
    }
  } catch (error) {
    console.error("Error invalidating cache by pattern:", error);
  }
};
