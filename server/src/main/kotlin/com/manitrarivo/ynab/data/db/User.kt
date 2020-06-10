package com.manitrarivo.ynab.data.db

import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
class User(
    @Column(nullable = false)
    val name: String
) {
    constructor(): this("<INVALID USER>")
    constructor(id: Int, name: String): this(name) {
        this.id = id
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0

    override fun toString() = this.name
}
