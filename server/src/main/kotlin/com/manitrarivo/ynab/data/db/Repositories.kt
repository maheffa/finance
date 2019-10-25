package com.manitrarivo.ynab.data.db

import org.springframework.data.repository.CrudRepository

public interface UserRepository: CrudRepository<User, Int>

public interface PayeeRepository: CrudRepository<Payee, Int> {
    fun findByNameIgnoreCase(name: String): Iterable<Payee>
}

public interface TransactionRepository: CrudRepository<Transaction, Int>
