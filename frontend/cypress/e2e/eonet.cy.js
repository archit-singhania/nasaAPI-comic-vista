describe('NASA EONET Frontend - End to End Tests', () => {
    beforeEach(() => {
        cy.visit('/eonet'); 
    });
    it('Loads EONET page and displays map with content', () => {
        cy.get('.leaflet-container', { timeout: 10000 }).should('exist');
        cy.contains(/Earth Natural Events/i).should('exist');
        cy.contains('Earth Observatory Natural Event Tracker').should('be.visible');
        cy.contains('Event Categories').should('be.visible');
        cy.get('.text-md.text-gray-400.max-w-2xl.mx-auto.text-center.mt-4').should('exist');
        cy.get('.text-lg.text-gray-300.max-w-3xl.mx-auto.text-center.leading-relaxed').should('exist');
        cy.get('.flex.flex-wrap.justify-center.gap-6.mb-8').should('exist');
        cy.get('.flex.items-center.gap-3.mb-8').should('exist');
        cy.get('.flex.flex-wrap.gap-4.mb-8').should('exist');
        cy.get('.flex.flex-wrap.gap-4.mb-8').should('exist');
        cy.get('.flex.flex-wrap.md\\:flex-nowrap.gap-4.md\\:gap-6.justify-between').should('exist');
        cy.get('.bg-gray-900.rounded-xl.shadow-2xl.p-6.border.border-gray-700\\/50').should('exist');
    });

    it('Displays loading state initially', () => {
        cy.contains('Loading NASA EONET Data...').should('be.visible');
        cy.contains('Connecting to Earth Observatory').should('be.visible');
        cy.get('.animate-spin').should('exist');
    });

    it('Displays event statistics correctly', () => {
        cy.contains('📊 Total Events')
        .closest('.group')
        .within(() => {
        cy.get('div.text-4xl', { timeout: 10000 }) 
        .should('exist')
        .invoke('text')
        .should('match', /^\d+$/);
        });
        cy.contains('🔥 Active Events')
        .closest('.group')
        .within(() => {
        cy.get('div.text-4xl', { timeout: 10000 })
        .should('exist')
        .invoke('text')
        .should('match', /^\d+$/);
        });
        cy.contains('✅ Closed Events')
        .closest('.group')
        .within(() => {
        cy.get('div.text-4xl', { timeout: 10000 })
        .should('exist')
        .invoke('text')
        .should('match', /^\d+$/);
        });
        cy.contains('🎯 Categories')
        .closest('.group')
        .within(() => {
        cy.get('div.text-4xl', { timeout: 10000 })
        .should('exist')
        .invoke('text')
        .should('match', /^\d+$/);
        });
    });

    it('Displays health status indicator', () => {
        cy.contains(/EONET Service Status/i, { timeout: 10000 }).should('exist');
        cy.contains(/Operational|Degraded/i, { timeout: 10000 }).should('exist');
        cy.contains(/EONET Service Status/i)
        .closest('div')  
        .should('be.visible')
    });

    it('Mission Control panel displays correctly', () => {
        cy.contains('🚀 Mission Control', { timeout: 10000 }).should('be.visible');
        cy.contains('🟢 System Online', { timeout: 10000 }).should('be.visible');
    });

    it('Displays and uses status filter', () => {
        cy.get('select').eq(0).should('have.value','all')
        cy.get('select').eq(0).select('open')
        cy.get('select').eq(0).select('closed')
    })

    it('Displays categories dropdown and filters by category', () => {
        cy.get('select').eq(1).should('exist')
        cy.get('select').eq(1).find('option').its('length').should('be.gt',1)
        cy.get('select').eq(1).select('wildfires')
        cy.get('.custom-event-marker').its('length').should('be.gt',0)
    })

    it('Time range filter works correctly', () => {
        cy.get('select').eq(2).should('have.value','30')
        cy.get('select').eq(2).select('7')
        cy.get('select').eq(2).select('365')
    })

    it('Active/Closed event visibility toggles work', () => {
        cy.get('#showActive').should('be.checked')
        cy.get('label[for="showActive"]').click()
        cy.get('#showActive').should('not.be.checked')
        cy.get('#showClosed').should('be.checked')
        cy.get('label[for="showClosed"]').click()
        cy.get('#showClosed').should('not.be.checked')
        cy.get('label[for="showActive"]').click()
        cy.get('label[for="showClosed"]').click()
    })

    it('Refresh button triggers data reload', () => {
        cy.contains('🚀 Refresh Data').click()
        cy.get('.custom-event-marker').should('have.length.greaterThan',0)
    })

    it('Health check button works', () => {
        cy.contains('💚 Check Health').click()
        cy.contains(/EONET Service Status/i).should('exist')
    })

    it('Handles clicking on a marker and showing event details', () => {
        cy.get('.custom-event-marker').first().click()
        cy.get('.leaflet-popup').should('be.visible')
        cy.get('.leaflet-popup').within(() => {
        cy.contains(/Status:/i).should('exist')
        cy.contains(/Category:/i).should('exist')
        cy.contains(/Started:/i).should('exist')
        cy.contains(/Location:/i).should('exist')
        cy.contains(/Data Points:/i).should('exist')
        cy.contains('View Full Details').should('exist')
        })
    })

    it('View Full Details button opens detailed view', () => {
        cy.get('.custom-event-marker').first().click()
        cy.get('.leaflet-popup').within(() => {
        cy.contains('View Full Details').click()
        })
        cy.contains('🛰️').should('exist')
        cy.contains('🌍 Coordinates').should('exist')
        cy.contains('📅 Date').should('exist')
    })

    it('Map controls are functional', () => {
        cy.get('.leaflet-control-zoom-in').click()
        cy.get('.leaflet-control-zoom-out').click()
        cy.get('.leaflet-control-layers').should('exist')
    })

    it('Statistics display correct numbers', () => {
        cy.get('div.text-4xl').eq(0).invoke('text').should('match',/^\d+$/)
        cy.get('div.text-4xl').eq(1).invoke('text').should('match',/^\d+$/)
        cy.get('div.text-4xl').eq(2).invoke('text').should('match',/^\d+$/)
        cy.get('div.text-4xl').eq(3).invoke('text').should('match',/^\d+$/)
    })

    it('Dismiss health indicator works', () => {
        cy.contains(/EONET Service Status/i).closest('div').within(() => {
        cy.get('button').click()
        })
        cy.contains(/EONET Service Status/i).should('not.exist')
    })

    it('Category filter updates events', () => {
        cy.get('select').eq(1).select('wildfires')
        cy.get('.custom-event-marker').its('length').should('be.gt',0)
    })

    it('Real-time indicators and status animations visible', () => {
        cy.get('.animate-pulse').should('exist')
        cy.get('.animate-bounce').should('exist')
        cy.contains('Real-time Updates').should('exist')
        cy.contains('Connected').should('exist')
    })

    it('Hover effects apply on interactive cards', () => {
        cy.get('div.group').first().trigger('mouseover')
        cy.get('div.group').first().should('have.css','transform')
    })

    it('Mission Control renders correctly', () => {
        cy.contains('🚀 Mission Control').should('exist')
        cy.contains('🟢 System Online').should('exist')
    })

    it('Health indicator shows and dismisses', () => {
        cy.contains('EONET Service Status').should('exist')
        cy.contains('EONET Service Status').closest('div').within(() => {
        cy.get('button').click()
        })
        cy.contains('EONET Service Status').should('not.exist')
    })

    it('Handles category filter with events visible', () => {
        cy.get('select').eq(1).select('wildfires')
        cy.get('.custom-event-marker').should('exist')
    })

    it('Shows health status pulse animation', () => {
        cy.contains('EONET Service Status').closest('div').find('.animate-pulse').should('exist')
    })

    it('Category cards display correct counts', () => {
        cy.get('div.group').eq(0).within(() => {
        cy.get('div.text-4xl').invoke('text').should('match', /^\d+$/)
        })
        cy.get('div.group').eq(1).within(() => {
        cy.get('div.text-4xl').invoke('text').should('match', /^\d+$/)
        })
        cy.get('div.group').eq(2).within(() => {
        cy.get('div.text-4xl').invoke('text').should('match', /^\d+$/)
        })
        cy.get('div.group').eq(3).within(() => {
        cy.get('div.text-4xl').invoke('text').should('match', /^\d+$/)
        })
    })

    it('Closed events percentage bar reflects correct width', () => {
        cy.get('div.group').eq(2).find('div.bg-gradient-to-r').invoke('attr','style').should('include','width')
    })

    it('Active events percentage bar reflects correct width', () => {
        cy.get('div.group').eq(1).find('div.bg-gradient-to-r').invoke('attr','style').should('include','width')
    })

    it('Categories card adjusts count based on filter', () => {
        cy.get('select').eq(1).select('wildfires')
        cy.get('div.group').eq(3).find('div.text-4xl').should('contain.text','1')
    })

    it('Real-time badge and connection indicators visible', () => {
        cy.contains('Real-time Updates').should('exist')
        cy.contains('Connected').should('exist')
        cy.get('.animate-pulse').should('exist')
        cy.get('.animate-bounce').should('exist')
    })

    it('Map renders with correct Leaflet container', () => {
        cy.get('.leaflet-container').should('exist')
        cy.get('.leaflet-grab').should('exist')
        cy.get('.leaflet-zoom-animated').should('exist')
    })

    it('Handles marker popup with event details', () => {
        cy.get('.custom-event-marker').first().click()
        cy.get('.leaflet-popup').within(() => {
        cy.contains('View Full Details').should('exist')
        cy.contains(/Status:/i).should('exist')
        cy.contains(/Category:/i).should('exist')
        cy.contains(/Started:/i).should('exist')
        cy.contains(/Location:/i).should('exist')
        cy.contains(/Data Points:/i).should('exist')
        })
    })

    it('Detailed view opens with coordinates and date', () => {
        cy.get('.custom-event-marker').first().click()
        cy.contains('View Full Details').click()
        cy.contains('🛰️').should('exist')
        cy.contains('🌍 Coordinates').should('exist')
        cy.contains('📅 Date').should('exist')
        cy.contains('Copy Event Info').should('exist')
        cy.contains('View on Google Maps').should('exist')
    })

    it('Copy event info to clipboard works', () => {
        cy.window().then(win => {
        cy.stub(win.navigator.clipboard, 'writeText').as('clipboardWrite')
        })
        cy.get('.custom-event-marker').first().click()
        cy.contains('View Full Details').click()
        cy.contains('Copy Event Info').click()
        cy.get('@clipboardWrite').should('have.been.called')
    })

    it('Google Maps external link opens', () => {
        cy.window().then(win => {
        cy.stub(win, 'open').as('windowOpen')
        })
        cy.get('.custom-event-marker').first().click()
        cy.contains('View Full Details').click()
        cy.contains('View on Google Maps').click()
        cy.get('@windowOpen').should('have.been.called')
    })

    it('Modal close button hides detailed view', () => {
        cy.get('.custom-event-marker').first().click()
        cy.contains('View Full Details').click()
        cy.get('button').contains('×').click()
        cy.contains('🛰️').should('not.exist')
    })

    it('Layer control toggles base maps', () => {
        cy.get('.leaflet-control-layers').click()
        cy.contains('Satellite View').click()
        cy.get('.leaflet-control-layers').click()
        cy.contains('Dark Map').click()
    })

    it('Category overlay layers toggle visibility', () => {
        cy.get('.leaflet-control-layers').click()
        cy.get('.leaflet-control-layers-overlays').find('input[type="checkbox"]').first().click()
        cy.get('.leaflet-control-layers-overlays').find('input[type="checkbox"]').first().click()
        })
        it('Skeleton loaders display during data load', () => {
        cy.visit('/eonet')
        cy.contains('Loading NASA EONET Data...').should('exist')
        cy.contains('Connecting to Earth Observatory').should('exist')
        cy.get('.animate-spin').should('exist')
        cy.get('.animate-pulse').should('exist')
    })

    it('Handles API failure with error message', () => {
        cy.intercept('GET','**/api/nasa/events**',{statusCode:500,body:{error:'Server Error'}}).as('getEventsFail')
        cy.visit('/eonet')
        cy.wait('@getEventsFail')
        cy.contains(/Cannot connect to NASA EONET server/i).should('exist')
        cy.contains(/check your connection/i).should('exist')
    })

    it('Handles network error gracefully', () => {
        cy.intercept('GET','**/api/nasa/events**',{forceNetworkError:true}).as('getNetworkFail')
        cy.visit('/eonet')
        cy.wait('@getNetworkFail')
        cy.contains(/Failed to fetch/i).should('exist')
    })

    it('Fallback categories appear when API fails', () => {
        cy.intercept('GET','**/api/nasa/categories**',{statusCode:404,body:{error:'Not Found'}}).as('getCategoriesFail')
        cy.visit('/eonet')
        cy.wait('@getCategoriesFail')
        cy.get('select').eq(1).find('option').should('have.length.greaterThan',1)
        cy.get('select').eq(1).should('contain.text','Wildfires')
    })

    it('Statistics card hover applies transform', () => {
        cy.get('div.group').first().trigger('mouseover')
        cy.get('div.group').first().should('have.css','transform')
    })

    it('High contrast mode elements remain visible', () => {
        cy.get('body').invoke('attr','style','forced-color-adjust: none')
        cy.get('.leaflet-container').should('exist')
        cy.get('div.group').should('exist')
    })

    it('Invalid events with no coordinates handled', () => {
        cy.intercept('GET','**/api/nasa/events**',{body:{events:[{id:'test',title:'NoCoords',geometries:[]}]}}).as('getNoCoords')
        cy.visit('/eonet')
        cy.wait('@getNoCoords')
        cy.get('.custom-event-marker').should('have.length',0)
        cy.contains(/No location data/i).should('exist')
    })

    it('Future dated events still render markers', () => {
        const future = new Date()
        future.setFullYear(future.getFullYear() + 1)
        cy.intercept('GET','**/api/nasa/events**',{body:{events:[{id:'future',title:'Future Event',date:future.toISOString(),geometries:[{coordinates:[0,0]}]}]}}).as('getFuture')
        cy.visit('/eonet')
        cy.wait('@getFuture')
        cy.get('.custom-event-marker').should('exist')
    })

    it('Keyboard navigation focuses interactive elements', () => {
        cy.get('select').eq(0).focus().should('have.focus')
        cy.get('select').eq(1).focus().should('have.focus')
        cy.get('select').eq(2).focus().should('have.focus')
        cy.contains('🚀 Refresh Data').focus().should('have.focus')
    })

    it('Multiple filters apply together correctly', () => {
        cy.get('select').eq(0).select('open')
        cy.get('select').eq(1).select('wildfires')
        cy.get('select').eq(2).select('7')
        cy.get('#showClosed').uncheck()
        cy.get('.custom-event-marker').each(marker => {
        cy.wrap(marker).should('have.attr','data-category','wildfires')
        cy.wrap(marker).should('have.attr','data-status','active')
    })
    })

    it('Filter reset button clears filters', () => {
        cy.get('select').eq(0).select('open')
        cy.get('select').eq(1).select('wildfires')
        cy.contains('Reset Filters').click()
        cy.get('select').eq(0).should('have.value','all')
        cy.get('select').eq(1).should('have.value','')
        cy.get('select').eq(2).should('have.value','30')
    })

    it('Real-time simulation with updated events', () => {
        cy.intercept('GET','**/api/nasa/events**',{fixture:'updated-events.json'}).as('getUpdated')
        cy.contains('🚀 Refresh Data').click()
        cy.wait('@getUpdated')
        cy.get('.custom-event-marker').should('have.length.greaterThan',0)
        cy.get('div.text-4xl').eq(0).invoke('text').should('match',/^\d+$/)
    })
});