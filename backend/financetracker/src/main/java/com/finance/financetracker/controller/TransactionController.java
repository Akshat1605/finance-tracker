package com.finance.financetracker.controller;

import com.finance.financetracker.dto.TransactionDTO;
import com.finance.financetracker.model.Transaction;
import com.finance.financetracker.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    // ✅ CREATE TRANSACTION
    @PostMapping
    public ResponseEntity<Transaction> addTransaction(@RequestBody TransactionDTO dto) {
        Transaction saved = service.addTransaction(dto);
        return ResponseEntity.ok(saved);
    }

    // ✅ GET ALL (ONLY LOGGED-IN USER)
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(service.getAllTransactions());
    }

    // ✅ FILTER BY DATE
    @GetMapping("/date")
    public ResponseEntity<List<Transaction>> getByDate(@RequestParam LocalDate date) {
        return ResponseEntity.ok(service.getTransactionsByDate(date));
    }

    // ✅ FILTER BY CATEGORY
    @GetMapping("/category")
    public ResponseEntity<List<Transaction>> getByCategory(@RequestParam String category) {
        return ResponseEntity.ok(service.getTransactionsByCategory(category));
    }

    // ✅ DELETE TRANSACTION
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        service.deleteTransaction(id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }
}