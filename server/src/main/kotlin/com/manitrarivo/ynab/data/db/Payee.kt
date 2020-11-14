package com.manitrarivo.ynab.data.db

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
data class Payee(
    @Column(name = "name", nullable = false) val name: String
) {
    constructor(): this("<INVALID PAYEE>")
    constructor(id: Int, name: String): this(name) {
        this.id = id
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0
}