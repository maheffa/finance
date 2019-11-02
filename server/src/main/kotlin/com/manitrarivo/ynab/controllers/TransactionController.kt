package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.BadRequestException
import com.manitrarivo.ynab.data.db.Payee
import com.manitrarivo.ynab.data.db.PayeeRepository
import com.manitrarivo.ynab.data.db.Transaction
import com.manitrarivo.ynab.data.db.TransactionRepository
import com.manitrarivo.ynab.data.db.UserRepository
import com.manitrarivo.ynab.data.request.TransactionCreateRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@CrossOrigin(origins = ["*"], allowedHeaders = ["*"])
@RestController
@RequestMapping("api/transaction")
class TransactionController {
    @Autowired
    private lateinit var userRepository: UserRepository
    @Autowired
    private lateinit var payeeRepository: PayeeRepository
    @Autowired
    private lateinit var transactionRepository: TransactionRepository

    @PostMapping("/create")
    fun createTransaction(@RequestBody request: TransactionCreateRequest): Transaction {
        val user = userRepository
            .findById(request.userId)
            .orElseThrow { throw BadRequestException(message = "User with ID: <" + request.userId + "> not found.") }
        val payeeName = request.payee.trim()
        val payee = payeeRepository
            .findByNameIgnoreCase(payeeName).toList()
            .getOrElse(0) { payeeRepository.save(Payee(payeeName)) }

        return transactionRepository.save(Transaction(
            date = request.date.atStartOfDay(),
            amount = request.amount,
            memo = request.memo,
            payee = payee,
            user = user))
    }
}