(function() {
    const style = document.createElement('style');
    style.textContent = `
        .pub-header-logos {
            padding-bottom: 0.55rem;
            margin-bottom: 0.55rem;
            border-bottom: 1px solid #e2e8f0;
        }

        .pub-header-logo-list {
            list-style: none;
            padding-left: 0;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 0.9rem;
        }

        .pub-header-logo-item {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .pub-header-logo-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            background: transparent;
            box-shadow: none;
        }

        .pub-header-logo-img {
            height: 36px;
            width: auto;
            max-width: 150px;
            object-fit: contain;
            display: block;
        }
    `;
    document.head.appendChild(style);

    const originalCreatePublicationItem = window.createPublicationItem;
    const originalVenueShortName = window.getVenueShortName;
    const originalVenueFullName = window.getVenueFullName;

    window.getVenueShortName = function(venueStr, year) {
        const text = String(venueStr || '');
        const yearSuffix = year && String(year).length === 4 ? `'${String(year).slice(2)}` : '';

        if (/SIGMOD/i.test(text)) return `SIGMOD${yearSuffix}`;
        if (/NDSS/i.test(text)) return `NDSS${yearSuffix}`;
        if (/JISA/i.test(text)) return 'JISA';

        return typeof originalVenueShortName === 'function'
            ? originalVenueShortName(venueStr, year)
            : text;
    };

    window.getVenueFullName = function(venueStr, year) {
        const text = String(venueStr || '');

        if (/SIGMOD/i.test(text)) return 'ACM International Conference on Management of Data';
        if (/NDSS/i.test(text)) return 'Network and Distributed System Security Symposium';
        if (/JISA/i.test(text)) return 'Journal of Information Security and Applications';

        return typeof originalVenueFullName === 'function'
            ? originalVenueFullName(venueStr, year)
            : text;
    };

    window.createPublicationItem = function(pub) {
        const item = typeof originalCreatePublicationItem === 'function'
            ? originalCreatePublicationItem(pub)
            : document.createElement('li');

        const entries = getPublicationHeaderLogoEntries(pub);
        if (!entries.length) {
            return item;
        }

        const content = item.querySelector('.pub-content-wrapper');
        if (!content) {
            return item;
        }

        content.insertBefore(buildPublicationHeaderLogos(entries), content.firstChild);
        return item;
    };

    function getPublicationHeaderLogoEntries(pub) {
        const entries = [];

        if (pub && Array.isArray(pub.logos)) {
            pub.logos.forEach(entry => {
                if (!entry) return;

                const src = entry.image || entry.src;
                if (!src) return;

                entries.push({
                    src,
                    alt: entry.alt || 'Logo',
                    link: entry.link || entry.url
                });
            });
        }

        return entries.slice(0, 2);
    }

    function buildPublicationHeaderLogos(entries) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pub-header-logos';

        const list = document.createElement('ul');
        list.className = 'pub-header-logo-list';

        entries.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'pub-header-logo-item';

            const link = document.createElement(hasUsableLink(entry.link) ? 'a' : 'span');
            link.className = 'pub-header-logo-link';

            if (hasUsableLink(entry.link)) {
                link.href = normalizeAssetPath(entry.link);
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }

            const img = document.createElement('img');
            img.className = 'pub-header-logo-img';
            img.loading = 'lazy';
            img.alt = entry.alt || 'Logo';
            img.src = normalizeAssetPath(entry.src);
            img.onerror = function() {
                li.remove();
            };

            link.appendChild(img);
            li.appendChild(link);
            list.appendChild(li);
        });

        wrapper.appendChild(list);
        return wrapper;
    }
})();
