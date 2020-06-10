package com.manitrarivo.ynab.business.converters

import org.junit.Test

import org.assertj.core.api.Assertions.assertThat
import java.time.LocalDate

fun getTransaction(row: String): List<String> = row.split(";")

class RevolutConverterTest {
    private val revolutConverter = RevolutConverter()

    @Test
    fun getDate() {
        val row1 = "July 3 ; Auto Top-Up by *7128  ;  ; 100,00 ;  ;  ; 230.20; general;"
        val row2 = "3 Jul 2019 ; Auto Top-Up by *7128  ;  ; 100,00 ;  ;  ; 230.20; general;"
        val res1 = revolutConverter.getDate(getTransaction(row1))
        val res2 = revolutConverter.getDate(getTransaction(row2))
        assertThat(res1).isEqualTo(LocalDate.of(LocalDate.now().year, 7, 3))
        assertThat(res2).isEqualTo(LocalDate.of(2019, 7, 3))
    }

    @Test
    fun getPayee() {
        val row = "June 28 ; Google  ; 16,99 ;  ;  ;  ; 75,12; entertainment;"
        val res = revolutConverter.getPayee(getTransaction(row))
        assertThat(res).isEqualTo("Google")
    }

    @Test
    fun getInflow() {
        val row = "June 7 ; Auto Top-Up by *7128  ;  ; 100,00 ;  ;  ; 207,78; general;"
        val res = revolutConverter.getInflow(getTransaction(row))
        assertThat(res).isEqualTo(100.0)
    }

    @Test
    fun getOutflow() {
        val row = "Jun 28, 2019 ; Google  ; 16,99 ;  ;  ;  ; 75,12; entertainment;"
        val res = revolutConverter.getOutflow(getTransaction(row))
        assertThat(res).isEqualTo(16.99)
    }
}