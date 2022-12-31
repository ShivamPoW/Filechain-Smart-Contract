;; Filechain Contract

;; Errors
(define-constant ERR_NO_SUCH_ENTRY (err u0))
(define-constant ERR_COMMIT_EXISTS (err u1)) 
(define-constant ERR_HASH_ALREADY_EXISTS (err u2)) 

;; Maps

;; Record of commits
(define-map commits
    {
        id: principal,
        count: uint
    }
    { 
        name: (string-utf8 500),   ;; for frontend & UX (Not required)
        merkle_root: (buff 64),    ;; SHA256 root of commit 
        files: uint                ;; Security for loss (Not strictly required)
    }
)

;; Record of last commit (Not strictly required)
(define-map last-commit principal uint) 

;; Read only functions

;; returns last commit of the User 
(define-read-only (get-last-commit) 
    (default-to u0 (map-get? last-commit tx-sender)) 
)

;; Gets requested commit tuple
(define-read-only (get-commit-info (count uint)) 
    (begin
        (asserts! (is-valid-commit count) (err u0))
        (ok (map-get? commits {id: tx-sender, count: count}))
    )
)

;; Gets merkle root of commit
(define-read-only (get-merkle-root (count uint)) 
    (default-to
        0x00
        (get merkle_root (map-get? commits {id: tx-sender, count: count}))
    )
)

;; Gets total commited files of the principal
(define-read-only (get-total-files (count uint))  
    (default-to 
        u0 
        (get files (map-get? commits {id: tx-sender, count: count}))
    )                  
)

;; Gets only the commit files
(define-read-only (get-total-commit-files (count uint)) 
    (let 
    ((current-files (get-total-files count)))  
        (asserts! (is-valid-commit count) u0)
        (if (> count u1) 
            (- current-files (get-total-files (- count u1)))
            current-files
        )
    )
)

;; Gets Commit name
(define-read-only (get-commit-name (count uint)) 
    (default-to 
        u""
        (get name (map-get? commits {id: tx-sender, count: count}))
    )
)

;; SHA256 of file < 1 Mb
(define-read-only (hash (a (buff 1048576)))     
   (sha256 a)
)

;; SHA256 of 2 Hashes
(define-read-only (hashBinary (a (buff 64))  (b (buff 64)))        
    (sha256   (concat  a b)) 
) 

;; Helper functions

;; Checks commit validity
(define-read-only (is-valid-commit (count uint)) 
    (let ((commit-number (get-last-commit)))
        (and (not (is-eq commit-number u0)) 
             (not (is-eq count u0))
             (>= commit-number count)
             
        )
    )
)

;; Prevents same hash to be added consecutively
(define-read-only (unique-merkle-root (count uint) (new-root (buff 64))) 
    (if (> count u1) 
        (let ((old-root (get-merkle-root (- count u1)))) 
            (not (is-eq old-root new-root)) 
        ) 
        true 
    ) 
) 

;; Public functions
(define-public (add-merkle-root (name (string-utf8 500)) (new-merkle-root (buff 64)) (files uint)) 
    (let ((old-count (get-last-commit)) 
          (new-count (+ old-count u1)) 
        
          (old-files (get-total-files old-count)) 
          (new-files (+ old-files files))) 
            (map-set last-commit tx-sender new-count) 
            (asserts! (unique-merkle-root new-count new-merkle-root) (err u2)) 
        
            (asserts!
    
                (map-insert commits
                {id: tx-sender, count: new-count}
                {name: name, merkle_root: new-merkle-root, files: new-files})
            (err u1)
            ) 
            (ok "commit-added") 
    ) 
) 
