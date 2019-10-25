package com.manitrarivo.ynab.services

import com.manitrarivo.ynab.data.db.PayeeRepository
import com.manitrarivo.ynab.data.db.TransactionRepository
import com.manitrarivo.ynab.data.db.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class CombinedTransactionService @Autowired constructor(
        private val userRepository: UserRepository,
        private val payeeRepository: PayeeRepository,
        private val transactionRepository: TransactionRepository
) {}
