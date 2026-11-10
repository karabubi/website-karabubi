import React, { useRef } from "react";

const screenshots = [
  { title: "Dashboard", image: "/xc-agent/dashboard.png" },
  { title: "Transactions", image: "/xc-agent/transactions.png" },
  { title: "Account Statements", image: "/xc-agent/account-statements.png" },
];

export default function XcAgentGallery() {
  const dialogRef = useRef(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
      >
        View Screenshots
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[90vh] w-[95%] max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 text-white backdrop:bg-black/80"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current.close();
          }
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            XC Agent Portal Gallery
          </h2>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-slate-600 px-4 py-2"
          >
            Close
          </button>
        </div>

        <div className="grid gap-6">
          {screenshots.map((item) => (
            <figure key={item.image}>
              <img
                src={item.image}
                alt={`XC Agent Portal ${item.title}`}
                className="w-full rounded-xl border border-slate-700"
              />

              <figcaption className="mt-3 text-center text-slate-300">
                {item.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </dialog>
    </>
  );
}
