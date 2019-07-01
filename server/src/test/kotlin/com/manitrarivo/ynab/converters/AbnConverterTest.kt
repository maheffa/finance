package com.manitrarivo.ynab.converters

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import org.apache.poi.ss.usermodel.Cell
import org.apache.poi.ss.usermodel.Row
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.time.LocalDate

fun mockRowWithCell(cellIndex: Int, value: String): Row {
    val cell = mock<Cell> {
        on { stringCellValue } doReturn value
    }
    return mock<Row> {
        on { getCell(cellIndex) } doReturn cell
    }
}
fun mockRowWithCell(cellIndex: Int, value: Double): Row {
    val cell = mock<Cell> {
        on { numericCellValue } doReturn value
    }
    return mock<Row> {
        on { getCell(cellIndex) } doReturn cell
    }
}

class AbnConverterTest {
    private val converter = AbnConverter()

    @Test
    fun getPayeeTRTP() {
        val desc = "/TRTP/SEPA Incasso algemeen doorlopend/CSID/NL90223130416110000/NAME/ESSENT RETAIL ENERG/MARF/000088417592/REMI/100721668285/KLANT 171809881 KNMRK 201500251/FACT 465352282294 DAT. 18122018/Termijn 76,00/IBAN/NL32ABNA0242244777/BIC/ABNANL2A/EREF/100721668285"
        val row = mockRowWithCell(7, desc)
        assertThat(converter.getPayee(row)).isEqualTo("Essent Retail Energ")
    }

    @Test
    fun getPayBEA() {
        val desc = "BEA   NR:Q446X1   10.01.19/19.25 WATERKANT AMSTERDAM,PAS132"
        val row = mockRowWithCell(7, desc)
        assertThat(converter.getPayee(row)).isEqualTo("Waterkant")
    }

    @Test
    fun getPayeeGEA() {
        val desc = "GEA   NR:00009209 13.02.19/18.51 Eurozone Amsterdam,PAS132"
        val row = mockRowWithCell(7, desc)
        assertThat(converter.getPayee(row)).isEqualTo("Eurozone")
    }

    @Test
    fun getPayeeSEPA() {
        val desc = "SEPA Overboeking IBAN: NL92RABO0145422933 BIC: RABONL2U Naam: ICL Holding NL Coop. UA Omschrijving: SALARIS JAN 2019 Kenmerk: 20190123 01745 08640 0070401 001 1"
        val row = mockRowWithCell(7, desc)
        assertThat(converter.getPayee(row)).isEqualTo("Icl Holding Nl Coop. Ua")
    }

    @Test
    fun getDate() {
        val date = 20190101.0
        val row = mockRowWithCell(2, date)
        assertThat(converter.getDate(row)).isEqualTo(LocalDate.of(2019, 1, 1))
    }
}