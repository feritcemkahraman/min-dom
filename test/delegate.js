import {
  delegate
} from 'min-dom';

import { expect } from 'chai';


describe('delegate', function() {

  it('should expose bind', function() {
    expect(typeof delegate.bind).to.equal('function');
  });


  it('should expose unbind', function() {
    expect(typeof delegate.unbind).to.equal('function');
  });


  it('should not match an ancestor outside the delegated element', function() {
    const outside = document.createElement('div');
    const root = document.createElement('div');
    const target = document.createElement('button');
    outside.className = 'match';
    outside.appendChild(root);
    root.appendChild(target);

    let calls = 0;
    const handler = delegate.bind(root, '.match', 'click', function() {
      calls++;
    });
    const event = new MouseEvent('click', { bubbles: true });

    target.dispatchEvent(event);

    expect(calls).to.equal(0);
    expect(event.delegateTarget).to.equal(null);

    delegate.unbind(root, 'click', handler);
  });


  it('should keep matching descendants and the delegated element itself', function() {
    const root = document.createElement('div');
    const matched = document.createElement('div');
    const target = document.createElement('button');
    root.className = matched.className = 'match';
    root.appendChild(matched);
    matched.appendChild(target);

    const matches = [];
    const handler = delegate.bind(root, '.match', 'click', function(event) {
      expect(this).to.equal(root);
      matches.push(event.delegateTarget);
    });

    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(matches).to.eql([ matched, root ]);

    delegate.unbind(root, 'click', handler);
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(matches).to.have.length(2);
  });


  it('should not match an outside ancestor for captured focus events', function() {
    const outside = document.createElement('div');
    const root = document.createElement('div');
    const target = document.createElement('button');
    outside.className = 'match';
    outside.appendChild(root);
    root.appendChild(target);

    let calls = 0;
    const handler = delegate.bind(root, '.match', 'focus', function() {
      calls++;
    });

    target.dispatchEvent(new FocusEvent('focus'));

    expect(calls).to.equal(0);

    delegate.unbind(root, 'focus', handler);
  });


  it('should delegate through Document, Window and DocumentFragment roots', function() {
    const fragment = document.createDocumentFragment();

    [ document, window, fragment ].forEach(function(root) {
      const target = document.createElement('button');
      target.className = 'match';
      const container = root === fragment ? fragment : document.body;
      container.appendChild(target);

      let calls = 0;
      const handler = delegate.bind(root, '.match', 'click', function(event) {
        expect(this).to.equal(root);
        expect(event.delegateTarget).to.equal(target);
        calls++;
      });

      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(calls).to.equal(1);
      delegate.unbind(root, 'click', handler);
      container.removeChild(target);
    });
  });

});
