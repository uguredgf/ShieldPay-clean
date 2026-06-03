#![no_std]
use soroban_sdk::{contract, contractimpl, log, panic_with_error, Env, Address, Symbol, Map, Vec};

#[derive(Copy, Clone)]
#[repr(u32)]
pub enum AspError {
    Unauthorized = 1,
    AddressAlreadyInList = 2,
    AddressNotFound = 3,
    InvalidAddress = 4,
}

#[contract]
pub struct AspContract;

#[contractimpl]
impl AspContract {
    /// Initialize ASP contract with admin (third-party independent ASP)
    pub fn init(env: Env, asp_admin: Address) {
        let admin_key = Symbol::new(&env, "asp_admin");
        env.storage().instance().set(&admin_key, &asp_admin);
        
        log!(&env, "ASP contract initialized with admin: {}", asp_admin);
    }

    /// Add address to allowlist (only ASP admin can call)
    pub fn add_to_allowlist(env: Env, address: Address) -> Result<(), AspError> {
        let admin_key = Symbol::new(&env, "asp_admin");
        let asp_admin: Address = env
            .storage()
            .instance()
            .get(&admin_key)
            .ok_or(AspError::Unauthorized)?;

        asp_admin.require_auth();

        // Add to allowlist in persistent storage
        let allowlist_key = Symbol::new(&env, "allowlist");
        let mut allowlist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&allowlist_key)
            .unwrap_or_else(|| Map::new(&env));

        if let Some(true) = allowlist.get(address.clone()) {
            return Err(AspError::AddressAlreadyInList);
        }

        allowlist.set(address.clone(), true);
        env.storage().persistent().set(&allowlist_key, &allowlist);

        // Remove from blocklist if present
        let blocklist_key = Symbol::new(&env, "blocklist");
        let mut blocklist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&blocklist_key)
            .unwrap_or_else(|| Map::new(&env));

        if blocklist.get(address.clone()).is_some() {
            blocklist.remove(address.clone());
            env.storage().persistent().set(&blocklist_key, &blocklist);
        }

        log!(&env, "Address added to allowlist: {}", address);
        Ok(())
    }

    /// Add address to blocklist (only ASP admin can call)
    pub fn add_to_blocklist(env: Env, address: Address) -> Result<(), AspError> {
        let admin_key = Symbol::new(&env, "asp_admin");
        let asp_admin: Address = env
            .storage()
            .instance()
            .get(&admin_key)
            .ok_or(AspError::Unauthorized)?;

        asp_admin.require_auth();

        // Add to blocklist in persistent storage
        let blocklist_key = Symbol::new(&env, "blocklist");
        let mut blocklist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&blocklist_key)
            .unwrap_or_else(|| Map::new(&env));

        if let Some(true) = blocklist.get(address.clone()) {
            return Err(AspError::AddressAlreadyInList);
        }

        blocklist.set(address.clone(), true);
        env.storage().persistent().set(&blocklist_key, &blocklist);

        // Remove from allowlist if present
        let allowlist_key = Symbol::new(&env, "allowlist");
        let mut allowlist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&allowlist_key)
            .unwrap_or_else(|| Map::new(&env));

        if allowlist.get(address.clone()).is_some() {
            allowlist.remove(address.clone());
            env.storage().persistent().set(&allowlist_key, &allowlist);
        }

        log!(&env, "Address added to blocklist: {}", address);
        Ok(())
    }

    /// Check if address is compliant
    /// Returns: true if in allowlist AND not in blocklist
    pub fn is_compliant(env: Env, address: Address) -> bool {
        // Check blocklist first (deny list takes priority)
        let blocklist_key = Symbol::new(&env, "blocklist");
        let blocklist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&blocklist_key)
            .unwrap_or_else(|| Map::new(&env));

        if let Some(true) = blocklist.get(address.clone()) {
            return false;
        }

        // Check allowlist
        let allowlist_key = Symbol::new(&env, "allowlist");
        let allowlist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&allowlist_key)
            .unwrap_or_else(|| Map::new(&env));

        allowlist.get(address).unwrap_or(false)
    }

    /// Remove address from allowlist (only ASP admin can call)
    pub fn remove_from_allowlist(env: Env, address: Address) -> Result<(), AspError> {
        let admin_key = Symbol::new(&env, "asp_admin");
        let asp_admin: Address = env
            .storage()
            .instance()
            .get(&admin_key)
            .ok_or(AspError::Unauthorized)?;

        asp_admin.require_auth();

        let allowlist_key = Symbol::new(&env, "allowlist");
        let mut allowlist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&allowlist_key)
            .unwrap_or_else(|| Map::new(&env));

        if !allowlist.get(address.clone()).is_some() {
            return Err(AspError::AddressNotFound);
        }

        allowlist.remove(address.clone());
        env.storage().persistent().set(&allowlist_key, &allowlist);

        log!(&env, "Address removed from allowlist: {}", address);
        Ok(())
    }

    /// Remove address from blocklist (only ASP admin can call)
    pub fn remove_from_blocklist(env: Env, address: Address) -> Result<(), AspError> {
        let admin_key = Symbol::new(&env, "asp_admin");
        let asp_admin: Address = env
            .storage()
            .instance()
            .get(&admin_key)
            .ok_or(AspError::Unauthorized)?;

        asp_admin.require_auth();

        let blocklist_key = Symbol::new(&env, "blocklist");
        let mut blocklist: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&blocklist_key)
            .unwrap_or_else(|| Map::new(&env));

        if !blocklist.get(address.clone()).is_some() {
            return Err(AspError::AddressNotFound);
        }

        blocklist.remove(address.clone());
        env.storage().persistent().set(&blocklist_key, &blocklist);

        log!(&env, "Address removed from blocklist: {}", address);
        Ok(())
    }

    /// Get current ASP admin
    pub fn get_asp_admin(env: Env) -> Result<Address, AspError> {
        let admin_key = Symbol::new(&env, "asp_admin");
        env.storage()
            .instance()
            .get(&admin_key)
            .ok_or(AspError::Unauthorized)
    }
}

mod test;
