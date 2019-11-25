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

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0

    @CreationTimestamp
    val created: LocalDateTime = LocalDateTime.now()
}
