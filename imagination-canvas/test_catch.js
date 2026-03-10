const p = Promise.reject({ data: { error: "not_in_channel", ok: false } });
p.catch(err => err.data?.error === "not_in_channel" ? err.data : Promise.reject(err))
 .then(res => console.log("Result:", res))
 .catch(err => console.log("Caught:", err));
