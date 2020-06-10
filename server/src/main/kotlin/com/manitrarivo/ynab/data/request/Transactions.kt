package com.manitrarivo.ynab.data.request import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDate

class Transactions {}

data class TransactionCreateRequest(
    @JsonFormat(pattern="yyyy-MM-dd") val date: LocalDate,
    val payee: String,
    val memo: String = "",
    val amount: Double,
    val userId: Int
)

data class TransactionUpdateRequest(
    val id: Int,
    val userId: Int?,
    @JsonFormat(pattern="yyyy-MM-dd") val date: LocalDate?,
    val payee: String?,
    val memo: String?,
    val amount: Double?
)

data class TransactionsCreateRequest(
    val transactions: List<TransactionCreateRequest>
)

data class TransactionsUpdateRequest(
    val transactions: List<TransactionUpdateRequest>
)

data class TransactionDeleteRequest(
    val transactions: List<Int>
)
