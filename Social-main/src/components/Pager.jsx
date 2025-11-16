// src/components/Pager.jsx
export default function Pager({ page, maxPage, setPage }) {
    return (
        <div style={{ display:"flex", gap:10, marginTop:10, alignItems:"center" }}>
            <button disabled={page <= 1} onClick={()=> setPage(p=> Math.max(1, p-1))}>Prev</button>
            <span>Page {page} / {maxPage}</span>
            <button disabled={page >= maxPage} onClick={()=> setPage(p=> Math.min(maxPage, p+1))}>Next</button>
        </div>
    );
}
