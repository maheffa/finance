package com.manitrarivo.ynab.business.converters

abstract class TransactionReader<Transaction>(var curRow: Int, var maxRow: Int) {
    abstract fun getRowByIndex(index: Int): Transaction

    fun hasNextTransaction() = this.curRow < this.maxRow

    fun getNextTransaction(): Transaction {
        val curRow = this.curRow
        this.curRow += 1
        return this.getRowByIndex(curRow)
    }
}