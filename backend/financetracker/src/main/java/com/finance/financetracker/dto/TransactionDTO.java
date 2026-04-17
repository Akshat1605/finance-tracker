package com.finance.financetracker.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TransactionDTO {
    private String type;
    private Double amount;
    private String category;
    private String description;
    private LocalDate date;
}
