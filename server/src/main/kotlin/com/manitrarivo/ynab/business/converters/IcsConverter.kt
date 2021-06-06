package com.manitrarivo.ynab.business.converters

import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.text.PDFTextStripper
import java.io.InputStream
import java.time.LocalDate

data class IcsTrans(val day: Int, val month: String, val desc: String, val amount: Double)

class IcsTransactionReader(inputStream: InputStream): TransactionReader<IcsTrans>(0, 0) {
    private val transactions: List<IcsTrans>

    init {
        val pdDocument = PDDocument.load(inputStream)
        val text = PDFTextStripper().getText(pdDocument)
        pdDocument.close()
        this.transactions = "(\\d\\d) (\\w+) \\d\\d \\w+ (.*) \\w+ ([\\d,\\.]+) (Af|Bij)"
                .toRegex()
                .findAll(text)
                .map { matchResult ->
                    val groups = matchResult.groupValues
                    IcsTrans(
                            groups[1].toInt(),
                            groups[2],
                            groups[3].trim(),
                            parseAmount(groups[4]
                                    .replace(".", "")
                                    .replace(",", ".")
                            ) * (if (groups[5] == "Bij") 1.0 else -1.0)

                    )
                }.toList()
        this.maxRow = this.transactions.size
    }

    override fun getRowByIndex(index: Int): IcsTrans = this.transactions[index]
}

class IcsConverter: Converter<IcsTrans>() {
    val months = listOf("jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec")

    override fun getReader(inputStream: InputStream): TransactionReader<IcsTrans> = IcsTransactionReader(inputStream)

    override fun getDate(transaction: IcsTrans) = LocalDate.now()
            .withDayOfMonth(transaction.day)
            .withMonth(months.indexOf(transaction.month) + 1)

    override fun getPayee(transaction: IcsTrans): String {
        val desc = transaction.desc.toLowerCase()
        return when {
            desc.startsWith("revolut") -> "to Revolut"
            desc.startsWith("ideal betaling") -> "from Daily Checking"
            desc.contains("uber") && desc.contains("eats") -> "Uber Eats"
            desc.contains("uber") && desc.contains("trip") -> "Uber Trip"
            desc.contains("youtube") -> "Youtube"
            desc.startsWith("google") -> cleanUp(desc).toUpperCase()
            else -> ""
        }
    }

    override fun getMemo(transaction: IcsTrans) = if (this.getPayee(transaction) == "") cleanUp(transaction.desc) else ""

    override fun getInflow(transaction: IcsTrans) = if (transaction.amount > 0.0) transaction.amount else 0.0

    override fun getOutflow(transaction: IcsTrans) = if (transaction.amount < 0.0) -transaction.amount else 0.0
}