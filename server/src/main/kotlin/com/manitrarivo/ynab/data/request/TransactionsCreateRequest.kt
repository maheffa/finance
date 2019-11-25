package com.manitrarivo.ynab.data.request

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

data class TransactionCreateRequest(
    @JsonFormat(pattern="yyyy-MM-dd") val date: LocalDate,
    val payee: String,
    val memo: String = "",
    val amount: Double,
    val userId: Int
)

data class TransactionsCreateRequest(
    val transactions: List<TransactionCreateRequest>
)