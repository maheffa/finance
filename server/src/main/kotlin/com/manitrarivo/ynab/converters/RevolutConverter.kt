package com.manitrarivo.ynab.converters

import org.apache.poi.ss.usermodel.Row
import java.io.InputStream
import java.lang.Exception
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class RevolutTransactionReader(inputStream: InputStream) : TransactionReader<List<String>>(0, 0) {
    private val rows: List<String>

    init {
        val content = String(inputStream.readAllBytes())
        rows = content.split("\\n".toRegex()).dropLast(1)
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

        return when {
            payee.startsWith("Uber") -> "Uber"
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

    private fun parseDouble(value: String) = try { value.trim().toDouble() } catch (e: Exception) { 0.0 }

    override fun getInflow(transaction: List<String>) = parseDouble(transaction[3])

    override fun getOutflow(transaction: List<String>) = parseDouble(transaction[2])
}
