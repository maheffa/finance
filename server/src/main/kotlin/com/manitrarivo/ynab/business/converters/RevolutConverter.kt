package com.manitrarivo.ynab.business.converters

import java.io.InputStream
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

fun parseAmount(value: String): Double {
    val trimmed = if (value.startsWith("\"") && value.endsWith("\"")) value.substring(IntRange(1, value.length - 2)) else value
    val decimal = trimmed.takeLast(3)

    return when {
        trimmed.isEmpty() || trimmed.isBlank() ->  0.0
        // 1,000.00 or 100.00
        decimal[0] == '.' -> trimmed.replace(",", "").toDouble()
        // 1.000,00 or 100,00
        decimal[0] == ',' -> trimmed.replace(".", "").replace(",", ".").toDouble()
        // If no decimal, remove "." or ","
        else -> trimmed.replace(",", "").replace(".", "").toDouble()
    }
}


class RevolutTransactionReader(inputStream: InputStream) : TransactionReader<List<String>>(0, 0) {
    private val rows: List<String>

    companion object {
        val DELIMITER = " , "
    }

    init {
        val content = String(inputStream.readAllBytes())
        rows = content.split("\\n".toRegex())
        this.maxRow = rows.size
        this.curRow = 1
    }

    override fun getRowByIndex(index: Int) = this.rows[index].split(DELIMITER).map { it.trim() }
}

class RevolutConverter: Converter<List<String>>() {
    override fun getReader(inputStream: InputStream) = RevolutTransactionReader(inputStream)

    override fun getDate(transaction: List<String>): LocalDate {
        try {
            return LocalDate.parse(
                transaction[0] + ", " + LocalDate.now().year.toString(),
                DateTimeFormatter.ofPattern("MMMM d, yyyy")
            )
        } catch(e: DateTimeParseException) {
            return LocalDate.parse(
                transaction[0],
                DateTimeFormatter.ofPattern("d MMM yyy")
            )
        }
    }

    override fun getPayee(transaction: List<String>): String {
        val payee = transaction[1]
        val payeeLowercase = payee.toLowerCase()

        // TODO:
        // 1- Transform "Exchange EUR to  FX Rate €1 = US$123.456789" to "to Revolut Portfolio"
        // 2- Transform "Patreon Membership FX Rate €1 = US$123.456789" to "Patreon Membership"
        // Do mention in the memo what's the exchange rate is.

        return when {
            payeeLowercase.startsWith("google") -> "Google"
            payeeLowercase.startsWith("amzn") || payee.contains("Amazon") -> "Amazon"
            payeeLowercase.startsWith("audible") -> "Audible"

            payeeLowercase.contains("booking.com") -> "Booking.com"
            payeeLowercase.contains("linode") -> "Linode"
            payeeLowercase.contains("top-up by") -> "from ICS"

            payeeLowercase.startsWith("bought eth with eur") || payeeLowercase.startsWith("bought btc with eur") -> "Crypto Purchase"
            payeeLowercase.startsWith("sold eth to eur") || payeeLowercase.startsWith("sold btc to eur") -> "Crypto Sale"

            payeeLowercase.startsWith("patreon membership") -> "Patreon Membership"

            payee == "Payment from Am Manitrarivo" -> "from Daily checking"

            else -> payee
        }
    }

    override fun getInflow(transaction: List<String>) = parseAmount(transaction[3])

    override fun getOutflow(transaction: List<String>) = parseAmount(transaction[2])
}
