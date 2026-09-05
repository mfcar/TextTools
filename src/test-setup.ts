import 'fake-indexeddb/auto';

if (typeof Element !== 'undefined' && typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = () => {
    // no-op: jsdom has no layout, so scrolling has no observable effect
  };
}

if (typeof URL !== 'undefined' && typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:stub';
  URL.revokeObjectURL = () => {
    // no-op: nothing to revoke without a real object URL
  };
}
