package com.manitrarivo.ynab.data.db

import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
data class Proportion (
    @ManyToOne @JoinColumn(name = "user_id") var user: User,
    var month: Int,
    var year: Int,
    var amount: Double
) {
    constructor(): this(User(), 0, 0, 0.0)
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0

    override fun toString() = "User=${this.user},date=${this.month}/${this.year},amount=${this.amount}"
}
