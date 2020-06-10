package com.manitrarivo.ynab.controllers

import com.manitrarivo.ynab.data.BadRequestException
import com.manitrarivo.ynab.data.db.Payee
import com.manitrarivo.ynab.data.db.PayeeRepository
import com.manitrarivo.ynab.data.db.Transaction
import com.manitrarivo.ynab.data.db.TransactionRepository
import com.manitrarivo.ynab.data.db.UserRepository
import com.manitrarivo.ynab.data.request.TransactionDeleteRequest
import com.manitrarivo.ynab.data.request.TransactionsCreateRequest
import com.manitrarivo.ynab.data.request.TransactionsUpdateRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import javax.ws.rs.QueryParam
import java.time.format.DateTimeFormatter


fun parseDate(dateString: String?, default: LocalDateTime): LocalDateTime {
    if (dateString == null || dateString.isEmpty() || dateString.isBlank()) {
        return default
    }
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val date = LocalDate.parse(dateString, formatter)
    return LocalDateTime.of(date, LocalTime.NOON)
}

val defaultPayee = Payee("")

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
    fun createTransaction(@RequestBody request: TransactionsCreateRequest): List<Transaction> {
        val payeeMap = mutableMapOf<String, Payee>()
        val defaultPayee = payeeRepository
            .findByNameIgnoreCase("").toList().getOrElse(0) { payeeRepository.save(defaultPayee) }
        request.transactions
            .map { it.payee.trim() }
            .onEach {payeeName ->
                payeeMap.putIfAbsent(
                    payeeName,
                    payeeRepository
                        .findByNameIgnoreCase(payeeName).toList()
                        .getOrElse(0) { payeeRepository.save(Payee(payeeName)) }
                )
            }
        val transactions = request.transactions.map {
            val user = userRepository
                .findById(it.userId)
                .orElseThrow { throw BadRequestException(message = "User with ID: <" + it.userId + "> not found.") }
            val payee = payeeMap.getOrDefault(it.payee.trim(), defaultPayee)

            Transaction(
                date = it.date.atStartOfDay(),
                amount = it.amount,
                memo = it.memo,
                payee = payee,
                user = user
            )
        }

        return transactionRepository.saveAll(transactions.asIterable()).toList()
    }

    @PostMapping("/update")
    fun updateTransaction(@RequestBody request: TransactionsUpdateRequest): List<Transaction> {
        val transactions = transactionRepository
            .findAllById(request.transactions.map { it.id })
            .map { it.id to it }
            .toMap()
        val users = userRepository
            .findAllById(request.transactions.map { it.userId }.distinct())
            .map { it.id to it }
            .toMap()

        val result = arrayListOf<Transaction>()

        for (updateTransaction in request.transactions) {
            transactions[updateTransaction.id]?.let { transactionObj ->
                users[updateTransaction.userId]?.let { transactionObj.user = it }
                updateTransaction.date?.let { transactionObj.date = it.atStartOfDay() }
                updateTransaction.payee?.let {payeeName ->
                    transactionObj.payee = payeeRepository
                        .findByNameIgnoreCase(payeeName.trim()).toList()
                        .getOrElse(0) { payeeRepository.save(Payee(payeeName.trim())) }
                }
                updateTransaction.memo?.let { transactionObj.memo = it }
                updateTransaction.amount?.let { transactionObj.amount = it }

                result.add(transactionObj)
            }
        }

        transactionRepository.saveAll(result)

        return result
    }

    @PostMapping("/delete")
    fun deleteTransaction(@RequestBody request: TransactionDeleteRequest): List<Int> {
        val transactions = transactionRepository.findAllById(request.transactions)
        val response = transactions.map { it.id }
        transactionRepository.deleteAll(transactions)

        return response;
    }


    @GetMapping("/all")
    fun allTransaction(@RequestParam("from") from: String?, @RequestParam("to") to: String?): List<Transaction> {
        val now = LocalDateTime.now()
        val monthAgo = LocalDateTime.now().minusDays(30)

        return transactionRepository.findAllByDateBetween(
            parseDate(from, monthAgo),
            parseDate(to, now)
        ).toList()
    }
}