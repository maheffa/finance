package com.manitrarivo.ynab.data

import io.lettuce.core.RedisClient
import io.lettuce.core.api.StatefulRedisConnection
import io.lettuce.core.api.sync.RedisStringCommands
import org.springframework.stereotype.Component
import java.util.*


@Component("redisCli")
class RedisCli {
    private final val client: RedisClient = RedisClient.create("redis://localhost")
    private final val connection: StatefulRedisConnection<String, String> = client.connect()
    private final val sync: RedisStringCommands<String, String> = connection.sync()

    fun createSession(): String {
        val array = ByteArray(20)
        Random().nextBytes(array)
        val sessId: String = Base64.getEncoder().encodeToString(array)
        sync.setex(sessId, 3600 * 24 * 15, sessId)
        return sessId
    }

    fun isValidSession(sessId: String) = sync.get(sessId) == sessId
}