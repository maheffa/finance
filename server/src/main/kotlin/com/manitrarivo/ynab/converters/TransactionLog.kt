package com.manitrarivo.ynab.converters

import java.time.LocalDate

data class TransactionLog(
        val date: LocalDate,
        val memo: String,
        val payee: String,
        val outFlow: Double,
        val inFlow: Double
)