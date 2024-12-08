-- Check dependencies on set_updated_at function
SELECT 
    trig.tgname as trigger_name,
    ns.nspname as schema_name,
    tab.relname as table_name,
    proname as function_name
FROM pg_trigger trig
JOIN pg_class tab ON trig.tgrelid = tab.oid
JOIN pg_proc p ON trig.tgfoid = p.oid
JOIN pg_namespace ns ON tab.relnamespace = ns.oid
WHERE proname = 'set_updated_at';
