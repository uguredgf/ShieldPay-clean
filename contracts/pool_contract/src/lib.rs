#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, log, Env, Address, Symbol, Bytes};

// Soroban'ın hata tiplerini XDR formatına çevirebilmesi için bu makro şart.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PoolError {
    Unauthorized = 1,
    NullifierAlreadyUsed = 2,
    InvalidProof = 3,
}

#[contract]
pub struct ShieldPayPoolContract;

#[contractimpl]
impl ShieldPayPoolContract {
    
    /// İşverenin fonları ve commitment'ları havuza kilitlediği fonksiyon.
    pub fn deposit(env: Env, commitment: Bytes, amount_encrypted: Bytes) {
        // 1. Dışarıya sadece toplam deposit tx görünmesi için TotalDeposited güncellenir
        let total_key = Symbol::new(&env, "total_dep");
        let current_total: i128 = env.storage().persistent().get(&total_key).unwrap_or(0);
        
        // Şimdilik sembolik bir artış yapıyoruz (İleride USDC transferi eklenecek)
        env.storage().persistent().set(&total_key, &(current_total + 1));
        
        log!(&env, "Deposit received. Commitment logged.");
    }

    /// Çalışanın ZK proof sunarak kendi fonunu çektiği fonksiyon.
    pub fn withdraw(env: Env, proof: Bytes, nullifier: Bytes, amount: i128, recipient: Address) -> Result<(), PoolError> {
        
        // 1. ZK Proof Doğrulaması (Verifier contract'ı çağırılacak)
        let is_valid_proof = true; // Şimdilik mock değer
        
        if !is_valid_proof {
            return Err(PoolError::InvalidProof);
        }

        // 2. Nullifier'ı kullanıldı olarak işaretleme ve havuzdan transfer işlemleri buraya eklenecek
        
        log!(&env, "Withdraw successful for recipient={}", recipient);
        Ok(())
    }

    /// Dış dünyaya sadece toplam yatırılan meblağı gösteren okuma fonksiyonu.
    pub fn get_total_deposited(env: Env) -> i128 {
        let total_key = Symbol::new(&env, "total_dep");
        env.storage().persistent().get(&total_key).unwrap_or(0)
    }
}