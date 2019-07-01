package com.manitrarivo.ynab.converters

import java.io.InputStream
import java.time.LocalDate

abstract class Converter<Transaction> {
    abstract fun getReader(inputStream: InputStream): TransactionReader<Transaction>
    abstract fun getDate(transaction: Transaction): LocalDate
    abstract fun getPayee(transaction: Transaction): String
    abstract fun getInflow(transaction: Transaction): Double
    abstract fun getOutflow(transaction: Transaction): Double

    open fun getMemo(transaction: Transaction) = ""

    fun convert(inputStream: InputStream): ArrayList<TransactionLog> {
        val logs = ArrayList<TransactionLog>()
        val reader = this.getReader(inputStream)

        while (reader.hasNextTransaction()) {
            val transaction = reader.getNextTransaction()
            logs.add(TransactionLog(
                    this.getDate(transaction),
                    this.getMemo(transaction),
                    this.getPayee(transaction),
                    this.getOutflow(transaction),
                    this.getInflow(transaction)
            ))
        }

        return logs
    }
}
