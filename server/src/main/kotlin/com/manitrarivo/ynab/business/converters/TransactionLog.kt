package com.manitrarivo.ynab.business.converters

import java.time.LocalDate

data class TransactionLog(
        val date: LocalDate,
        val memo: String,
        val payee: String,
        val outFlow: Double,
        val inFlow: Double
)