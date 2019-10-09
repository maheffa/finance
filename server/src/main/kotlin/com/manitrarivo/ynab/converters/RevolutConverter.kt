package com.manitrarivo.ynab.converters

import java.io.InputStream
import java.lang.Math.round
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*

fun parseDouble(value: String) = try { value.trim().toDouble() } catch (e: Exception) { 0.0 }

class RevolutTransactionReader(inputStream: InputStream) : TransactionReader<List<String>>(0, 0) {
    private val rows: List<String>

    init {
        val content = String(inputStream.readAllBytes())
        val raw = content.split("\\n".toRegex())
        val filteredRows = raw.filter { !it.contains("Invisoble Saving") && it.trim().isNotEmpty() }.toMutableList()
        val savings = raw.filter { it.contains("Invisoble Saving") }
        val totalSaving = savings
                .map { parseDouble(it.split(";")[2]) }
                .sum()
        val lastRow: String = SimpleDateFormat("MMM d, yyyy").format(Date()) +
                ";Vault Saving;" + round(totalSaving).toString() + ";;"
        filteredRows.add(lastRow)
        rows = filteredRows.filter { it.split(";").isNotEmpty() }
        this.maxRow = rows.size
        this.curRow = 1
    }

    override fun getRowByIndex(index: Int) = this.rows[index].split(";")
}

class RevolutConverter: Converter<List<String>>() {
    override fun getReader(inputStream: InputStream) = RevolutTransactionReader(inputStream)

    override fun getDate(transaction: List<String>): LocalDate {
        return LocalDate.parse(
                transaction[0].trim(),
                DateTimeFormatter.ofPattern("LLL d, yyyy")
        )
    }

    override fun getPayee(transaction: List<String>): String {
        val payee = transaction[1].trim()

        // TODO: Transform "Exchange EUR to  FX Rate €1 = US$123.456789" to "to Revolut Portfolio"
        return when {
            payee.startsWith("Google") -> "Google"
            payee.startsWith("Amzn") || payee.contains("Amazon") -> "Amazon"
            payee.startsWith("Audible") -> "Audible"

            payee.contains("Booking.com") -> "Booking.com"
            payee.contains("Linode") -> "Linode"
            payee.contains("Top-Up by") -> "from ICS"

            payee == "Payment from Am Manitrarivo" -> "from Daily checking"

            else -> payee
        }
    }

    override fun getInflow(transaction: List<String>) = parseDouble(transaction[3])

    override fun getOutflow(transaction: List<String>) = parseDouble(transaction[2])
}
