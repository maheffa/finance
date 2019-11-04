package com.manitrarivo.ynab.converters

import java.io.InputStream
import java.lang.Math.round
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.*

fun parseDouble(value: String): Double {
    val trimmed = value.trim()
    val decimal = trimmed.takeLast(3)
    return when {
        // 1,000.00 or 100.00
        decimal[0] == '.' -> trimmed.replace(",", "").toDouble()
        // 1.000,00 or 100,00
        decimal[0] == ',' -> trimmed.replace(".", "").replace(",", ".").toDouble()
        // If no decimal, remove "." or ","
        else -> trimmed.replace(",", "").replace(".", "").toDouble()
    }
}

fun isVaultSavingRow(row: String) = row.contains("Invisible Saving") || row.contains("Boatin-drakitra")

class RevolutTransactionReader(inputStream: InputStream) : TransactionReader<List<String>>(0, 0) {
    private val rows: List<String>

    init {
        val content = String(inputStream.readAllBytes())
        val raw = content.split("\\n".toRegex())
        val filteredRows = raw.filter { !isVaultSavingRow(it) && it.trim().isNotEmpty() }.toMutableList()
        val savings = raw.filter { isVaultSavingRow(it) }
        val totalSaving = savings
                .map { parseDouble(it.split(";")[2]) }
                .sum()
        val lastRow: String = SimpleDateFormat("MMMM d").format(Date()) +
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
        try {
            return LocalDate.parse(
                transaction[0].trim() + ", " + LocalDate.now().year.toString(),
                DateTimeFormatter.ofPattern("MMMM d, yyyy")
            )
        } catch(e: DateTimeParseException) {
            return LocalDate.parse(
                transaction[0].trim(),
                DateTimeFormatter.ofPattern("d MMM yyy")
            )
        }
    }

    override fun getPayee(transaction: List<String>): String {
        val payee = transaction[1].trim()

        // TODO:
        // 1- Transform "Exchange EUR to  FX Rate €1 = US$123.456789" to "to Revolut Portfolio"
        // 2- Transform "Patreon Membership FX Rate €1 = US$123.456789" to "Patreon Membership"
        // 3- Transform "You Need A Budget FX Rate €1 = US$1.0967" to "You Need A Budget"
        // Or, case 2 & 3 can be generalized.
        // Do mention in the memo what's the exchange rate is.
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
