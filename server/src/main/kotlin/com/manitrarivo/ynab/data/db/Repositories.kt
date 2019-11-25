package com.manitrarivo.ynab.data.db

import org.springframework.data.repository.CrudRepository
import java.time.LocalDateTime

public interface UserRepository: CrudRepository<User, Int>

public interface PayeeRepository: CrudRepository<Payee, Int> {
    fun findByNameIgnoreCase(name: String): Iterable<Payee>
}

public interface TransactionRepository: CrudRepository<Transaction, Int> {
    fun findAllByDateBetween(from: LocalDateTime, to: LocalDateTime): Iterable<Transaction>
}
