package com.manitrarivo.ynab.converters

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.springframework.core.io.ClassPathResource

class IcsConverterTest {
    @Test
    fun extractTransaction() {
        val ins = ClassPathResource("raw/ics.pdf").inputStream
        val icsReader = IcsTransactionReader(ins)
        assertThat(icsReader.getRowByIndex(0)).isEqualTo(IcsTrans(
                22, "jun", "IDEAL BETALING, DANK", 690.37
        ))
        assertThat(icsReader.getRowByIndex(1)).isEqualTo(IcsTrans(
                14, "jun", "REVOLUT*9532* REVOLUT.COM", -100.0
        ))
        assertThat(icsReader.getRowByIndex(5)).isEqualTo(IcsTrans(
                29, "jun", "VIAVAN AMSTERDAM", -8.29
        ))
    }
}