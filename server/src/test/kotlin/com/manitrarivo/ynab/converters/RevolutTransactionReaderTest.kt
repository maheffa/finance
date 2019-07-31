package com.manitrarivo.ynab.converters

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

import java.io.InputStream

class RevolutTransactionReaderTest {

    @Test
    fun getRowByIndex() {
        val input = "Jul 3, 2019 ; To Invisoble Saving  ; 1.25 ;  ;  ;  ; 130.20; transfers;\n" +
                "Jul 3, 2019 ; To Invisoble Saving  ; 2.45 ;  ;  ;  ; 131.45; transfers;"
        val ins: InputStream = input.byteInputStream()
        val reader = RevolutTransactionReader(ins)
        assertThat(reader.getRowByIndex(0)[2]).isEqualTo("4")
    }
}