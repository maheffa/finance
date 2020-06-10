package com.manitrarivo.ynab.business.converters

import org.apache.poi.hssf.usermodel.HSSFWorkbook
import org.apache.poi.ss.usermodel.Row
import org.apache.poi.ss.usermodel.Sheet
import java.io.InputStream
import java.lang.Exception
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class AbnTransactionReader(inputStream: InputStream) : TransactionReader<Row>(0, 0) {
    private val sheet: Sheet

    init {
        this.sheet = HSSFWorkbook(inputStream).getSheetAt(0)
        this.maxRow = sheet.lastRowNum
        this.curRow = 1
    }

    override fun getRowByIndex(index: Int): Row = this.sheet.getRow(index)
}

class AbnConverter: Converter<Row>() {
    private val payeeWordTransformers = arrayOf(
            { word: String -> if (word.startsWith("CCV*")) word.split("*")[1] else word },
            { word: String -> if (word == "AH") "Albert Heijn" else word },
            { word: String -> this.formatName(word) }
    )
    private val payeeAcceptableWords = arrayOf(
            { word: String -> !word.toLowerCase().startsWith("amst") },
            { word: String -> !word.matches("\\d+".toRegex()) }
    )
    
    override fun getReader(inputStream: InputStream) =  AbnTransactionReader(inputStream)

    override fun getDate(transaction: Row): LocalDate = LocalDate.parse(
            transaction.getCell(2).numericCellValue.toInt().toString(),
            DateTimeFormatter.ofPattern("yyyyMMdd")
    )

    override fun getPayee(transaction: Row): String {
        val desc = transaction.getCell(7).stringCellValue
        if (!(desc.startsWith("BEA")
                        || desc.startsWith("GEA")
                        || desc.startsWith("/TRTP/")
                        || desc.startsWith("SEPA"))) {
            return ""
        }

        if (desc.startsWith("/TRTP")) {
            return "/NAME/([^/]*)/"
                    .toRegex()
                    .findAll(desc).map { this.formatName(it.groups[1]?.value) }
                    .toList()[0]
        }

        if (desc.startsWith("SEPA")) {
            return try {
                "Naam: (.*) Omschrijving"
                        .toRegex()
                        .findAll(desc).map { this.formatName(it.groups[1]?.value) }
                        .toList()[0]
            } catch(e: Exception) {
                ""
            }
        }

        var words = desc.split("\\s+".toRegex())
        words = words.subList(3, words.size - 1)
        words = payeeAcceptableWords.fold(words, { accepted, accept -> accepted.filter(accept) })
        words = payeeWordTransformers.fold(words, { transformed, transformer -> transformed.map(transformer) })
        return words.joinToString(" ")
    }

    override fun getMemo(transaction: Row): String {
        val desc = transaction.getCell(7).stringCellValue
        return if (this.getPayee(transaction) == "") desc else ""
    }

    override fun getInflow(transaction: Row): Double {
        val amount = transaction.getCell(6).numericCellValue
        return if (amount > 0) amount else 0.0
    }

    override fun getOutflow(transaction: Row): Double {
        val amount = transaction.getCell(6).numericCellValue
        return if (amount < 0) -amount else 0.0
    }

    private fun formatName(sentence: String?, defaultName: String = ""): String {
        if (sentence === null) {
            return defaultName
        }
        return sentence
                .split("\\s+".toRegex())
                .joinToString(" ") { it.toLowerCase().capitalize() }
    }

}
