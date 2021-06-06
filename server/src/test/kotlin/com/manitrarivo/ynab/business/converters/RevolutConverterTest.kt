package com.manitrarivo.ynab.business.converters

import org.junit.Test

import org.assertj.core.api.Assertions.assertThat
import java.time.LocalDate

fun getTransaction(row: String): List<String> = row.split(RevolutTransactionReader.DELIMITER)

class RevolutConverterTest {
    private val revolutConverter = RevolutConverter()

    private val rows = arrayOf(
        "29 May 2021 , Bought BTC with EUR FX Rate €1 = 0.00003333 BTC, Fee: 0.00002465 BTC , 25.00 ,  ,  EUR 25.00 ,  , 203.84, General, ",
        "28 Apr 2021 , google Play Ap  , 30.99 ,  ,  ,  , 269.01, Utilities, ",
        "12 Dec 2020 , IDEAL Top-Up  ,  , 200.00 ,  ,  , 304.30, Transfers, ",
        "6 Apr 2021 , To Adama Mahefa Manitrarivo  , \"1,300.00\" ,  ,  ,  , 295.89, Transfers, Sent from Revolut"
    )

    @Test
    fun getDate() {
        val res = rows.map { revolutConverter.getDate(getTransaction(it)) }
        assertThat(res[0]).isEqualTo(LocalDate.of(2021, 5, 29))
        assertThat(res[1]).isEqualTo(LocalDate.of(2021, 4, 28))
        assertThat(res[2]).isEqualTo(LocalDate.of(2020, 12, 12))
        assertThat(res[3]).isEqualTo(LocalDate.of(2021, 4, 6))
    }

    @Test
    fun getPayee() {
        assertThat(revolutConverter.getPayee(getTransaction(rows[1]))).isEqualTo("Google")
    }

    @Test
    fun getInflow() {
        assertThat(revolutConverter.getInflow(getTransaction(rows[0]))).isEqualTo(0.0)
        assertThat(revolutConverter.getInflow(getTransaction(rows[1]))).isEqualTo(0.0)
        assertThat(revolutConverter.getInflow(getTransaction(rows[2]))).isEqualTo(200.0)
        assertThat(revolutConverter.getInflow(getTransaction(rows[3]))).isEqualTo(0.0)
    }

    @Test
    fun getOutflow() {
        assertThat(revolutConverter.getOutflow(getTransaction(rows[0]))).isEqualTo(25.0)
        assertThat(revolutConverter.getOutflow(getTransaction(rows[1]))).isEqualTo(30.99)
        assertThat(revolutConverter.getOutflow(getTransaction(rows[2]))).isEqualTo(0.0)
        assertThat(revolutConverter.getOutflow(getTransaction(rows[3]))).isEqualTo(1300.0)
    }
}